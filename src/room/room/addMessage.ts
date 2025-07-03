import { Socket } from "socket.io";

const addMessage = async (socket: Socket, roomId: string) => {
  socket.to(roomId).emit("add-message", roomId);
  return;
};

export default addMessage;
