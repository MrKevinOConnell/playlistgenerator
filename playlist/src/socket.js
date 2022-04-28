import React from 'react'
import {io} from 'socket.io-client'

const SocketContext = React.createContext(undefined as any) 
export default SocketContext