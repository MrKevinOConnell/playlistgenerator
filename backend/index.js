const express = require('express')
const cors = require('cors')
const path = require('path')
const { createServer } = require("http");
const { Server } = require("socket.io");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const PORT = process.env.PORT || 8888
const application = express()
const server = createServer(application)
export const io = new Server(server, {
  serveClient: false,
  cors: {
    origin: '*'
  },
  transports: ['websocket']
})
application.use(express.json())
application.use(express.urlencoded({ extended: true }))
application.use(cors())

const AuthRoutes = require('./routes/authRoutes.js')
application.use(cors())
application.use('/api', AuthRoutes)
application.use(express.static(path.resolve(__dirname, './../playlist/build')))
application.get('/*', (req, res) => res.sendFile(path.resolve(__dirname, './../playlist/build', 'index.html')))

io.on('connection', (socket) => {
console.log('connected')
})
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}:)`)
})
