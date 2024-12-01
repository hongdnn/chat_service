
import { Document, PaginateModel, Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const ConversationStatus = {
    Active: 0,
    Deleted: -1
}

export const ConversationType = {
    Private: 0,
    Group: 1
}

export class Conversation {
    _id: string
    conversation_name: string
    status: number
    image: string
    created_date: string
    conversation_type: number
    user_ids: Array<string>
    latest_message_time: string

    constructor(dto: any){
        this._id = dto._id
        this.conversation_name = dto.conversation_name
        this.status = dto.status
        this.image = dto.image
        this.user_ids = this.user_ids
        this.conversation_type = dto.conversation_type
        this.latest_message_time = this.latest_message_time
    }
}

const conversationSchema = new Schema({
    conversation_name: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: ConversationStatus.Active
    },
    image: {
        type: String,
        default: null
    },
    conversation_type: {
        type: Number,
        require: true
    },
    user_ids: {
        type: Array,
        require: true
    },
    latest_message_time: {
        type: String,
        default: () => new Date().toISOString()
    },
}, { timestamps: { createdAt: 'created_date' } })

conversationSchema.plugin(paginate)

export const ConversationModel = model<Conversation, PaginateModel<Document<Conversation>>>('conversation', conversationSchema)