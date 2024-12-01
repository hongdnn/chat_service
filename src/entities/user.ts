
import { Document, PaginateModel, Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

export class User {
    _id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    password: string
    image: string
    status: string

    constructor(dto: any){
        this._id = dto._id
        this.email = dto.email
        this.password = dto.password
        this.first_name = dto.first_name
        this.last_name = dto.last_name
        this.status = dto.status
        this.phone = dto.phone
    }
}

const userSchema = new Schema({
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        default: null
    },
    first_name: {
        type: String,
        require: true
    },
    last_name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null
    },
    status: {
        type: String,
        required: true
    },
})

userSchema.plugin(paginate)

export const UserModel = model<User, PaginateModel<Document<User>>>('user', userSchema)