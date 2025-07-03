const addMessage = async (socket, roomId) => {
    socket.to(roomId).emit("add-message", roomId);
    return;
};
export default addMessage;
//# sourceMappingURL=addMessage.js.map