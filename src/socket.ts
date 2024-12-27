import { Server } from "http";
import { Socket } from "socket.io";
import { IMessageService } from "./controllers/services/message.service";
import { myContainer } from "./inversify.config";
import { TYPES } from "./types";
import { IConversationService } from "./controllers/services/conversation.service";
import { Server as SocketIOServer } from "socket.io";
import { Token } from "./JwtToken/JwtToken";

const users = {}

const messageService: IMessageService = myContainer.get<IMessageService>(TYPES.IMessageService)
const conversationService: IConversationService = myContainer.get<IConversationService>(TYPES.IConversationService)
const jwtToken: Token = myContainer.get<Token>(TYPES.Token)

export const socketio = (server: Server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type"],
            credentials: true
        }
    })

    /* middleware */
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        console.log(token)
        const user = jwtToken.getUser(token);
        if (user) {
            console.log(`'user connected: ${user.id}, socket: ${socket.id}`)
            users[user.id] = socket.id;
            next();
        } else {
            next(new Error('Socket authentication error'));
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log('a user connected:', socket.id)

        // Send private message
        socket.on('private_message', async (data) => {
            const { sender_id, receiver_id, message, message_type } = data
            console.log(sender_id, receiver_id, message, message_type)
            const conversationResult = await conversationService.getPrivateConversation(sender_id, receiver_id)
            const response = await messageService.sendMessage(message, message_type, conversationResult.data.sender, conversationResult.data.conversation)
            const room = conversationResult.data.conversation._id

            // Join the room
            if (!socket.rooms.has(room)) {
                socket.join(room)
            }
            const receiverSocket = users[receiver_id]
            if(receiverSocket != null) {
                if (!receiverSocket.rooms.has(room)) {
                    receiverSocket.join(room)
                }
            }

            io.to(room).emit('receive_private_message', response)
        })

        // Create group message
        socket.on('group_message', async (data) => {
            const { senderId, receiverIds, conversationName } = data
            const response = await conversationService.createConversation(senderId, receiverIds, conversationName)
            const room = response.data._id

            // Join the room
            socket.join(room)
            for (let receiverId of receiverIds) {
                const receiverSocket = users[receiverId]
                receiverSocket.join(room)
            }

            socket.to(room).emit('create_group_conversation', response)
        })

        // Send group message
        socket.on('group_message', async (data) => {
            const { senderId, conversation_id, message, message_type } = data
            const conversationResult = await conversationService.getGroupConversation(conversation_id, senderId)
            if (conversationResult != null) {
                const response = await messageService.sendMessage(message, message_type, conversationResult.data.sender, conversationResult.data.comversation, conversationResult.data.members)
                const room = conversation_id

                // Join the room
                if (!socket.rooms.has(room)) {
                    socket.join(room)
                }

                socket.to(room).emit('receive_group_message', response)
            }
        })

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`${socket.id} disconnected`)
        })
    })
}