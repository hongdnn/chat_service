import { Router, Request, Response } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { IMessageService } from "../services/message.service"






export const messageRouter = Router()



const messageService: IMessageService = myContainer.get<IMessageService>(TYPES.IMessageService)

messageRouter.get('/', async (req: Request, res: Response) => {
    try {
        const conversationId = req.query.conversation_id
        const date = req.query.date ? new Date(req.query.date as string) : undefined;
        const size = req.query.size
        const result = await messageService.fetchMessagesByConversation(conversationId.toString(), date, parseInt('' + size))
        return res.status(200).json(result)
    } catch(error) {
        return res.status(500).json({ error })
    }
}) 

