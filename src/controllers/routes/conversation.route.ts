import { Router, Request, Response } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { IConversationService } from "../services/conversation.service"






export const conversationRouter = Router()



const conversationService: IConversationService = myContainer.get<IConversationService>(TYPES.IConversationService)

conversationRouter.get('/', async (req: Request, res: Response) => {
    try {

        const jwtToken = req.headers.authorization
        const page = req.query.page
        const size = req.query.size
        const result = await conversationService.getConversationList(jwtToken, parseInt('' + page), parseInt('' + size))

        return res.status(200).json(result)
    } catch(error) {
        return res.status(500).json({ error })
    }
}) 

