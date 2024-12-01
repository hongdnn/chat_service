import { injectable } from "inversify";
import { User } from "../entities/user";
import { BaseRepository, IBaseRepository } from "./base.repository";


export interface IUserRepository extends IBaseRepository<User> {
    getUserByEmail(email: string): Promise<User | null>
    getUserInfo(id: string): Promise<User | null>
}

@injectable()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
    
    public async getUserByEmail(email: string): Promise<User> {
        const user = await this._mongooseModel.findOne({ email }, {_id: 1, email: 1, password: 1, first_name: 1, last_name: 1, phone: 1, image: 1, status: 1 })         
        if (user !== null) {
            return user.toObject<User>()
        }
        return null
    }

    public async getUserInfo(id: string): Promise<User> {
        const user = await this._mongooseModel.findOne({ _id: id }, {_id: 1, email: 1, first_name: 1, last_name: 1, phone: 1, image: 1})         
        if (user !== null) {
            return user.toObject<User>()
        }
        return null
    }

}