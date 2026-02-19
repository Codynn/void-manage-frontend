import { io } from "socket.io-client";

let socket: ReturnType<typeof io> | null = null;

export const connectSocket = (token: string) => {
  if (!socket) {
    socket = io("https://manage-api.voidnepal.com.np/api", { // replace with your backend URL
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server:", socket?.id);
      socket?.emit("authenticate", token); // send JWT for auth
    });
  }
  return socket;
};

export const getSocket = () => socket;
