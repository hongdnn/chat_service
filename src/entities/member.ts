import { Document, PaginateModel, Schema, model } from "mongoose"
import paginate from "mongoose-paginate-v2"



export class Member {
    _id: string
    conversation_id: string
    user_id: string
    joined_time: string
    left_time: string
    is_admin: boolean
    nick_name: string
    is_left: boolean

    constructor(dto: any){
        this._id = dto._id
        this.conversation_id = dto.conversation_id
        this.user_id = dto.user_id
        this.joined_time = dto.joined_time
        this.left_time = dto.left_time
        this.is_admin = dto.is_admin
        this.nick_name = dto.nick_name
        this.is_left = dto.is_left
    }
}

const memberSchema = new Schema({
    message: {
        type: String,
        require: true
    },
    conversation_id: {
        type: String,
        require: true
    },
    user_id: {
        type: String,
        require: true
    },
    joined_time: {
        type: String,
        require: true
    },
    left_time: {
        type: String,
        default: null
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    nick_name: {
        type: String,
        default: ''
    },
    is_left: {
        type: Boolean,
        default: false
    },
})

memberSchema.plugin(paginate)

export const MemberModel = model<Member, PaginateModel<Document<Member>>>('member', memberSchema)