import { inject, injectable } from "inversify"
import { User } from "../../entities/user"
import { TYPES } from "../../types";
import { IUserRepository } from "../../repositories/user.repository";
import { Bcrypt } from "../../environment";
import bcrypt from 'bcryptjs'
import { Token } from "../../JwtToken/JwtToken";




export interface IUserService {
    login(email: string, password: string): Promise<{ token: string, user: User, status: number, message: string }>
    registerUser(user: User): Promise<{ status: number, message: string }>
}


@injectable()
export class UserService implements IUserService {
    @inject(TYPES.IUserRepository) private readonly _userRepo: IUserRepository
    @inject(TYPES.Token) private readonly _jwtToken: Token

    public async login(email: string, password: string): Promise<{ token: string, user: User, status: number; message: string }> {
        const user = await this._userRepo.getUserByEmail(email)
        if(user !== null) {
            const match = await bcrypt.compare(password, user.password)
            if(match) {
                const token = await this._jwtToken.generateToken(user.email, user.last_name, user.first_name, user._id, user.status)
                delete user.password
                delete user.status
                return { token, user, status: 0, message: 'Login success' }
            }
        }
        return { token: '', user: null, status: 1, message: 'Email or password maybe incorrect' }
    }
    
    public async registerUser(user: User): Promise<{ status: number, message: string }> {
        const checkExsitedUser = await this._userRepo.getUserByEmail(user.email)
        if (checkExsitedUser === null) {
            user.status = 'active'
            const passwordHash = await bcrypt.hash(user.password, Bcrypt.SaltRound)
            user.password = passwordHash
            await this._userRepo.create(user)
            return { status: 0, message: 'Login success' };
        }
        return { status: 1, message: 'This email is existed' };

    }
    
}