import { Date, Document, PaginateModel, Schema, model } from "mongoose"
import paginate from "mongoose-paginate-v2"


const MessageStatus = {
    Deleted: -1,
    Sent: 0,
    Read: 1
}

const MessageType = {
    Text: 'text',
    Image: 'image',
    Video: 'video',
    System: 'system'
}



export class Message {
    _id: string
    message: string
    conversation_id: string
    member_id: string
    created_date: Date
    updated_date: Date
    status: number
    message_type: string

    constructor(dto: any){
        this._id = dto._id
        this.message = dto.message
        this.conversation_id = dto.conversation_id
        this.member_id = dto.member_id
        this.created_date = dto.created_date
        this.updated_date = dto.updated_date
        this.status = dto.status
        this.message_type = dto.message_type
    }
}

const messageSchema = new Schema({
    message: {
        type: String,
        require: true
    },
    conversation_id: {
        type: String,
        require: true
    },
    member_id: {
        type: String,
        require: true
    },
    status: {
        type: Number,
        default: MessageStatus.Sent
    },
    message_type: {
        type: String,
        default: MessageType.Text
    },
}, { timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' } })

messageSchema.plugin(paginate)

export const MessageModel = model<Message, PaginateModel<Document<Message>>>('message', messageSchema)