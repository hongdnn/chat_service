import express from 'express'
import cors from 'cors'
import { errors } from 'celebrate'
import { userRouter } from '../controllers/routes/user.route'
import { conversationRouter } from '../controllers/routes/conversation.route'
import { authenticate } from '../middlewares/middleware'

export class ExpressLoader {
    constructor() {}

    configExpress(app) {
        app.use(express.json())
        app.use(cors()) 
        
        //user
        app.use('/users', userRouter)
        //conversation
        app.use('/conversations', authenticate, conversationRouter)

        //middleware error
        app.use(errors())

        app.get('/', (req, res) => res.send('Welcome to Social App'))
    }
}