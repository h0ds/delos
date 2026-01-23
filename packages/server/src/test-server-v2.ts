import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { config } from './config.js'

console.log('All imports successful')

const app = express()
const httpServer = createServer(app)

console.log('Express app created')

app.use(cors(config.cors))
app.use(express.json())

console.log('Middleware added')

app.get('/api/status', (_req, res) => {
  res.json({ status: 'ok' })
})

console.log('Routes added')

httpServer.listen(config.port, () => {
  console.log(`[server] running on port ${config.port}`)
})
