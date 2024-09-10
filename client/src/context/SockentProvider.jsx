import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";


const SocketContext = createContext(null)

export const useSocket = () => {
    return useContext(SocketContext)
}

const SocketContextProvider = ({ children }) => {
    const socket = useMemo(() => io("localhost:3000"), [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketContextProvider

