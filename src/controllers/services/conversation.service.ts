import { inject, injectable } from "inversify"
import { TYPES } from "../../types"
import { Conversation, ConversationType } from "../../entities/conversation"
import { Member } from "../../entities/member"
import { IUserRepository } from "../../repositories/user.repository"
import { IConversationRepository } from "../../repositories/conversation.repository"
import { IMemberRepository } from "../../repositories/member.repository"
import { Token } from "../../JwtToken/JwtToken"
import { IMessageRepository } from "../../repositories/message.repository"


export interface IConversationService {
    createConversation(senderId: string, receiverIds: string[], conversationName?: string): Promise<{ data: any, status: number, message: string }>
    getPrivateConversation(senderId: string, receiverId: string): Promise<{ data: any, status: number, message: string }>
    getGroupConversation(conversationId: string, senderId: string): Promise<{ data: any, status: number, message: string }>
    getConversationList(jwtToken: string, size: number, date?: Date): Promise<{data: any, status: number, message: string }>
}


@injectable()
export class ConversationService implements IConversationService {

    @inject(TYPES.IUserRepository) private readonly _userRepo: IUserRepository
    @inject(TYPES.IConversationRepository) private readonly _conversationRepo: IConversationRepository
    @inject(TYPES.IMemberRepository) private readonly _memberRepo: IMemberRepository
    @inject(TYPES.IMessageRepository) private readonly _messageRepo: IMessageRepository
    @inject(TYPES.Token) private readonly _jwtToken: Token


    public async createConversation(senderId: string, receiverIds: string[], conversationName?: string): Promise<{ data: any, status: number, message: string }> {
        try {
            const sender = await this._userRepo.getUserInfo(senderId)
            if (sender === null) {
                return { data: null, status: 1, message: 'SenderId invalid' }
            }
            const dto = new Conversation({ 
                conversation_name: conversationName || '',
                conversation_type: receiverIds.length > 1 ? ConversationType.Group : ConversationType.Private })
            const conversation = await this._conversationRepo.create(dto)
            const sendMemberDto = new Member({
                user_id: senderId,
                conversation_id: conversation._id,
                is_admin: true,
                joined_time: new Date()
            })
            const sendMember = await this._memberRepo.create(sendMemberDto)
            for (let receiverId in receiverIds) {
                const receiveMemberDto = new Member({
                    user_id: receiverId,
                    conversation_id: conversation._id,
                    is_admin: true,
                    joined_time: new Date()
                })
                const receiveMember = await this._memberRepo.create(receiveMemberDto)
            }
            if (conversation !== null) {
                const responseData = { conversation, sender }
                return { data: responseData, status: 0, message: 'Create conversation success' }
            }
        } catch (error) {
            return { data: null, status: 1, message: error }
        }
    }

    public async getPrivateConversation(senderId: string, receiverId: string): Promise<{ data: any; status: number; message: string }> {
        const conversation = await this._conversationRepo.findByCondition({
            conversation_type: ConversationType.Private, 
            user_ids: { $all: [senderId, receiverId], $size: 2 }
        })
        if (conversation.length === 0) {
            return await this.createConversation(senderId, [receiverId])
        }
        const sender = await this._userRepo.getUserInfo(senderId)
        return { data: { conversation: conversation[0], sender }, status: 0, message: 'Success' }
    }

    public async getGroupConversation(conversationId: string, senderId: string): Promise<{ data: any; status: number; message: string }> {
        const conversation = await this._conversationRepo.getById(conversationId)
        if(conversation != null) {
            const sender = await this._userRepo.getUserInfo(senderId)
            return { data: { conversation, sender }, status: 0, message: 'Success' }
        }
        return { data: null, status: 0, message: 'Success' }
    }

    public async getConversationList(jwtToken: string, size: number, date?: Date): Promise<{ data: any; status: number; message: string }> {
        const userData = this._jwtToken.getUserInfo(jwtToken)
        try {
            const condition = { 
                user_ids: { $in: [userData.id] },
                latest_message_time: date ? { $lt: date } : { $lte: new Date() }
            }
            const sort = { latest_message_time: -1 }
            const conversations = await this._conversationRepo.fetchPaginatedResults(
                condition, 0, size, sort
            )
            let response = []
            for(let conversation of conversations) {
                const messages = await this._messageRepo.fetchMessagesByConversation(conversation._id.toString(), size)
                let conversationData = {
                    _id: conversation._id,
                    conversation_name: conversation.conversation_name,
                    conversation_type: conversation.conversation_type,
                    image: conversation.image,
                    created_date: conversation.created_date,
                    messages
                }
                response.push(conversationData)
            }
            return { data: response, status: 0, message: 'Success' }
        } catch (error) {
            return { data: {}, status: 1, message: error }
        }
    }
}