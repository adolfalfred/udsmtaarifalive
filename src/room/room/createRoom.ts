import { Socket } from "socket.io";

const createRoom = (socket: Socket, id: string) => {
  try {
    socket.join(id);
    console.log(id);
    socket.emit("room-created", id);
  } catch (error) {
    console.log(error);
    socket.emit("room-error", { error, message: "An error occured!" });
  }
  return;
};

export default createRoom;
