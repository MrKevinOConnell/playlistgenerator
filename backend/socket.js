const SocketServer = require("socket.io")
const Server = SocketServer.Server;
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const PORT = process.env.PORT || 8888
let io = 
module.exports = {
  init: (server) => {
   io =  new Server(server, {
        serveClient: false,
        cors: {
          origin: '*'
        },
        transports: ['websocket']
      })
    return io;
  },
  get: () => {
    if (!io) {
      throw new Error("socket is not initialized");
    }
    return io;
  }
};