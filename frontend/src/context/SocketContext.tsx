import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const userId = user?.userId || user?.id; // backend returns 'id', jwt payload uses 'sub'
        console.log('SocketProvider: User:', user, 'Token:', !!token, 'Computed UserID:', userId);

        if (user && userId) {
            // Connect to WebSocket
            const newSocket = io('http://localhost:3000', {
                query: { userId: userId },
                transports: ['websocket']
            });

            newSocket.on('connect', () => {
                console.log('Socket Connected:', newSocket.id);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user, token]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocket must be used within a SocketProvider');
    return context;
};
