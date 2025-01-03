import { inject, injectable } from "inversify"
import { TYPES } from "../../types"
import { IMessageRepository } from "../../repositories/message.repository";
import { Message } from "../../entities/message";
import { Conversation } from "../../entities/conversation";
import { IConversationRepository } from "../../repositories/conversation.repository";
import { Member } from "../../entities/member";
import { IMemberRepository } from "../../repositories/member.repository";
import { IUserRepository } from "../../repositories/user.repository";
import { User } from "../../entities/user";



export interface IMessageService {
    sendMessage(message: string, message_type: string, sender: User, conversation: Conversation, members?: Member[]): Promise<{ data: any, status: number, message: string }>
    fetchMessagesByConversation(conversationId: string, date: Date, size: number): Promise<{ data: any, status: number, message: string }>
}


@injectable()
export class MessageService implements IMessageService {
    @inject(TYPES.IUserRepository) private readonly _userRepo: IUserRepository
    @inject(TYPES.IMessageRepository) private readonly _messageRepo: IMessageRepository
    @inject(TYPES.IConversationRepository) private readonly _conversationRepo: IConversationRepository
    @inject(TYPES.IMemberRepository) private readonly _memberRepo: IMemberRepository


    public async sendMessage(message: string, messageType: string, sender: User, conversation: Conversation, members?: Member[]): Promise<{ data: any; status: number; message: string; }> {
        try {
            const member = await this._memberRepo.findByCondition({
                conversation_id: conversation._id,
                user_id: sender._id
            })
            const messageDto = new Message({
                message: message,
                conversation_id: conversation._id,
                member_id: member[0]._id,
                message_type: messageType
            })
            const createdMessage = await this._messageRepo.create(messageDto);
            await this._conversationRepo.update(conversation._id, {
                    latest_message_time: createdMessage.created_date
            })
            if (createdMessage !== null) {
                const responseData = {
                    _id: createdMessage._id,
                    message: message,
                    message_type: messageType,
                    created_date: createdMessage.created_date,
                    updated_date: createdMessage.updated_date,
                    status: createdMessage.status,
                    conversation: {
                        _id: conversation._id,
                        conversation_name: conversation.conversation_name,
                        image: conversation.image,
                        conversation_type: conversation.conversation_type,
                        members
                    },
                    sender: {
                        _id: member[0]._id,
                        user_id: sender._id,
                        first_name: sender.first_name,
                        last_name: sender.last_name,
                        image: sender.image,
                        nick_name: member[0].nick_name
                    }
                }
                return { data: responseData, status: 0, message: 'Send message success' }
            }
        } catch (error) {
            return { data: {}, status: 1, message: error }
        }
    }

    public async fetchMessagesByConversation(conversationId: string, date: Date, size: number): Promise<{ data: any; status: number; message: string; }> {
        try {
            console.log(conversationId)
            const response = await this._messageRepo.fetchMessagesByConversation(conversationId, size, date)
            return {data: response, status: 0, message: 'Fetch messages success' }
        } catch (error) {
            return { data: {}, status: 1, message: error }
        }
        
    }
}
