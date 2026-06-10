import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children, accountId, deviceName }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState(null);

  useEffect(() => {
    if (!accountId) return;
    const socket = io("https://syncwave-server-live.onrender.com/", { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", { accountId, deviceName });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("state_update", (s) => setState(s));

    return () => socket.disconnect();
  }, [accountId, deviceName]);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  return (
    <SocketContext.Provider value={{ connected, state, setState, emit, socketId: socketRef.current?.id }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
