const createRoom = (socket, id) => {
    try {
        socket.join(id);
        console.log(id);
        socket.emit("room-created", { id });
    }
    catch (error) {
        console.log(error);
        socket.emit("room-error", { error, message: "An error occured!" });
    }
    return;
};
export default createRoom;
//# sourceMappingURL=createRoom.js.map