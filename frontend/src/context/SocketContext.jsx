import { useState } from "react";
import { useEffect } from "react";
import { createContext } from "react";
import {io} from 'socket.io-client'

export const SocketContext = createContext(null);

export const SocketContextProvider = (props)=> {
   const [socket,setSocket] = useState(null);

   useEffect(()=> {
     const newSocket = io("http://localhost:5001");

     setSocket(newSocket);

     return () => {
      newSocket.disconnect();
    };
   },[])

   return <SocketContext.Provider value={socket}>{props.children}</SocketContext.Provider>
}