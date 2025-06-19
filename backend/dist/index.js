"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT;
const wss = new ws_1.WebSocketServer({ port: Number(PORT) });
let userCount = 0;
let allUsers = [];
wss.on("connection", (socket) => {
    userCount = userCount + 1;
    console.log("user connected : " + userCount);
    socket.on("message", (e) => {
        const data = JSON.parse(e.toString());
        if (data.type === "join") {
            allUsers.push({ socket, roomId: data.roomId });
            console.log(allUsers);
        }
        if (data.type === "chat") {
            let CurrentUser = allUsers.find(x => x.socket == socket);
            if (CurrentUser) {
                let users = allUsers.filter(x => x.roomId == CurrentUser.roomId);
                users.forEach((user) => {
                    user.socket.send(JSON.stringify({
                        sender: user.socket == socket ? "You" : "Other",
                        msg: data.msg
                    }));
                });
            }
        }
    });
    socket.on("close", () => {
        allUsers = allUsers.filter(x => x.socket != socket);
        console.log(allUsers);
    });
});
