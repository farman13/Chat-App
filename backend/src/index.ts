import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let userCount = 0;

interface user {
    socket: WebSocket,
    roomId: string
}

let allUsers: user[] = [];

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
                    }))
                })
            }
        }

    })

    socket.on("close", () => {
        allUsers = allUsers.filter(x => x.socket != socket);
        console.log(allUsers);
    })
})