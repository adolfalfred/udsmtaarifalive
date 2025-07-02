import dotenv from "dotenv";
import express from "express";
import http from "http";
import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import RoomHandler from "./room/index.js";
import Notifier from "./notification/route.js";
dotenv.config();
const app = express();
if (process.env.HOSTS) {
    const hosts = process.env.HOSTS.split(",") ?? "*";
    app.use(cors({ credentials: true, origin: hosts }));
}
else
    app.use(cors({ credentials: true, origin: "*" }));
app.use(compression());
app.use(bodyParser.json({ limit: "1024mb" }));
app.use(bodyParser.urlencoded({ limit: "1024mb", extended: true }));
const server = http.createServer(app);
server.listen(process.env.PORT_NO, () => {
    console.log(`Listening for requests at port ${process.env.PORT_NO}\nFor development mode go to http://localhost:${process.env.PORT_NO}/api`);
});
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
io.on("connection", (socket) => RoomHandler(socket, io));
instrument(io, { auth: false });
app.use("/socket", express.static("./node_modules/@socket.io/admin-ui/ui/dist"));
app.get("/", (_req, res) => {
    res.status(200).json("API is healthy").end();
});
app.get("/api", (req, res) => {
    res.status(200).json("API is running...").end();
});
app.use("/public", express.static("public"));
app.use("/notify", Notifier);
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found!" }).end();
});
//# sourceMappingURL=index.js.map