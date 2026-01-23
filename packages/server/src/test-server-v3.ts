import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { config } from './config.js'

console.log('All imports successful')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: config.cors })

console.log('Socket.io server created')

app.use(cors(config.cors))
app.use(express.json())

console.log('Middleware added')

app.get('/api/status', (_req, res) => {
  res.json({ status: 'ok' })
})

io.on('connection', socket => {
  console.log(`[socket] client connected: ${socket.id}`)
  socket.on('disconnect', () => {
    console.log(`[socket] client disconnected: ${socket.id}`)
  })
})

console.log('Socket listeners added')

httpServer.listen(config.port, () => {
  console.log(`[server] running on port ${config.port}`)
})
