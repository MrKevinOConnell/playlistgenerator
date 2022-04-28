import React, { useEffect, useContext, useState, useCallback } from 'react'
import SocketContext from './shared/context/SocketContext'

const SocketInstance = () => {
  const currentSocket = useContext(SocketContext)

  const listener = useCallback(message => {
    console.log(message)
  }, [])

  useEffect(() => {
    console.log(currentSocket)

    currentSocket.on('some-event', listener)
    return () => currentSocket.off('some-event', listener)
  }, [])

  return (
    <div></div>
  )
}