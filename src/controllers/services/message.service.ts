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
    sendPrivateMessage(message: string, message_type: string, senderId: string, receiverId: string): Promise<{ data: any, status: number, message: string }>
    sendMessage(message: string, message_type: string, sender: User, conversation: Conversation): Promise<{ data: any, status: number, message: string }>
}


@injectable()
export class MessageService implements IMessageService {
    @inject(TYPES.IUserRepository) private readonly _userRepo: IUserRepository
    @inject(TYPES.IMessageRepository) private readonly _messageRepo: IMessageRepository
    @inject(TYPES.IConversationRepository) private readonly _conversationRepo: IConversationRepository
    @inject(TYPES.IMemberRepository) private readonly _memberRepo: IMemberRepository


    public async sendPrivateMessage(message: string, message_type: string, senderId: string, receiverId: string): Promise<{ data: any, status: number, message: string }> {
        try {
            const sender = await this._userRepo.getById(senderId)
            if (sender === null) {
                return { data: {}, status: 1, message: 'SenderId invalid' }
            }
            const dto = new Conversation({})
            const conversation = await this._conversationRepo.create(dto)
            const sendMemberDto = new Member({
                user_id: senderId,
                conversation_id: conversation._id,
                is_admin: true,
                joined_time: new Date().toISOString()
            })
            const sendMember = await this._memberRepo.create(sendMemberDto)
            const receiveMemberDto = new Member({
                user_id: receiverId,
                conversation_id: conversation._id,
                is_admin: true,
                joined_time: new Date().toISOString()
            })
            const receiveMember = await this._memberRepo.create(receiveMemberDto)
            const messageDto = new Message({
                message: message,
                conversation_id: conversation._id,
                user_id: senderId,
                message_type: message_type
            })
            const createdMessage = await this._messageRepo.create(messageDto)
            if (createdMessage !== null) {
                return { data: createdMessage, status: 0, message: 'Create first message success' }
            }
        } catch (error) {
            return { data: {}, status: 1, message: error }
        }
    }

    public async sendMessage(message: string, message_type: string, sender: User, conversation: Conversation): Promise<{ data: any; status: number; message: string; }> {
        try {
            const messageDto = new Message({
                message: message,
                conversation_id: conversation._id,
                user_id: sender._id,
                message_type: message_type
            })
            const createdMessage = await this._messageRepo.create(messageDto);
            const [_, member] = await Promise.all([
                this._conversationRepo.update(conversation._id, {
                    latest_message_time: new Date(createdMessage.created_date).toISOString()
                }),
                this._memberRepo.findByCondition({
                    conversation_id: conversation._id,
                    user_id: sender._id
                })
            ])
            if (createdMessage !== null) {
                const responseData = {
                    _id: createdMessage._id,
                    message: message,
                    message_type: message_type,
                    created_date: createdMessage.created_date,
                    updated_date: createdMessage.updated_date,
                    status: createdMessage.status,
                    conversation: {
                        _id: conversation._id,
                        conversation_name: conversation.conversation_name,
                        image: conversation.image,
                        conversation_type: conversation.conversation_type
                    },
                    sender: {
                        _id: sender._id, // userId
                        member_id: member[0]._id,
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
}