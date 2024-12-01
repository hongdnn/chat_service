import { Request, Response, Router } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { IUserService } from "../services/user.service"
import { celebrate } from "celebrate"
import { createUserDto, loginDto } from "../celebrates/user.dto"
import { IMessageService } from "../services/message.service"




export const userRouter = Router()



const userService: IUserService = myContainer.get<IUserService>(TYPES.IUserService)
const messageService: IMessageService = myContainer.get<IMessageService>(TYPES.IMessageService)

userRouter.post('/register', celebrate(createUserDto), async (req: Request, res: Response) => {
    try {
        const dto = req.body
        const result = await userService.registerUser(dto)
        if(!result) {
            return res.status(404).json({ message: 'This email is existed' })
        }
        return res.status(200).json()
    } catch(error) {
        return res.status(500).json({ error })
    }
}) 

userRouter.post('/login', celebrate(loginDto), async (req: Request, res: Response) => {
    try {

        const dto = req.body

        
        const resultLogin = await userService.login(dto.email, dto.password)
        return res.status(200).json(resultLogin)
    } catch (error) {
        return res.status(500).json({ errors: error.errors })
    }
})


