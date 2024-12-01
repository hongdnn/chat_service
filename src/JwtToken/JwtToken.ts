import 'reflect-metadata'
import jwt from 'jsonwebtoken'
import { injectable } from 'inversify';
import {Jwt} from '../environment'

@injectable()
export class Token{

    constructor(){
        
    }

    public generateToken(email: string, last_name: string, first_name: string, id: string, status: string): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign({ last_name, first_name, email, id, status, iss: Jwt.ValidIssuer, aud: Jwt.ValidAudience },
                Jwt.SecretKey, { expiresIn: Jwt.ExpiryTimeInHours },
                (err, token) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(token)
                }
            )
        })
    }

    public getUserInfo(bearerToken: string){
        let realToken = bearerToken.split(" ")[1];        
        let userInfo = jwt.decode(realToken)
        return userInfo
    }
}