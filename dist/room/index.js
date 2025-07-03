import createRoom from "./room/createRoom.js";
import addMessage from "./room/addMessage.js";
const RoomHandler = async (socket, io) => {
    socket.on("create-room", (id) => createRoom(socket, id));
    socket.on("send-message", (r, u, n, m) => addMessage(socket, r, u, n, m));
    // socket.on("join-room", (rest) => joinRoom({ ...rest, socket }));
    // socket.on("send-message", (rest) => addMessage({ ...rest, socket }));
    // socket.on("validate-roomId", (r) => validateRoom(socket, r));
    // socket.on("start-typing", (rest) => isTyping({ ...rest, socket }));
    // socket.on("stop-typing", (rest) => notTyping({ ...rest, socket }));
    // socket.on("im-online", (r) => isOnline(socket, r));
    // socket.on("do-revalidate", (r) => revalidator(io, r));
    // socket.on("disconnect", () => disconnectPeer(socket));
};
export default RoomHandler;
//# sourceMappingURL=index.js.map