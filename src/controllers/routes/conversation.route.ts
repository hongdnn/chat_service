import { Router, Request, Response } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { IConversationService } from "../services/conversation.service"
import { celebrate } from "celebrate"
import { getConversationListDto } from "../celebrates/conversation.dto"






export const conversationRouter = Router()



const conversationService: IConversationService = myContainer.get<IConversationService>(TYPES.IConversationService)

conversationRouter.get('/', celebrate(getConversationListDto), async (req: Request, res: Response) => {
    try {

        const jwtToken = req.headers.authorization
        const date = req.query.date ? new Date(req.query.date as string) : undefined;
        const size = req.query.size
        const result = await conversationService.getConversationList(jwtToken, parseInt('' + size), date)

        return res.status(200).json(result)
    } catch(error) {
        return res.status(500).json({ error })
    }
}) 

