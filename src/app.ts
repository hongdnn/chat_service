import express from 'express'
import { loader } from './loaders/index'
import { PORT } from './environment'
import { socketio } from './socket'

async function startServer() {
    const app = express()
    await loader({ expressApp: app })
    const server = app.listen(PORT, () => console.log('Chat service is ready'))
    socketio(server)
}

startServer()