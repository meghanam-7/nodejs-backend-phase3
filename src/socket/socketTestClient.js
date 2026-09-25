const { io } = require("socket.io-client");

const TOKEN = process.env.SOCKET_TOKEN;

const socket = io("http://localhost:3000", {
    auth: {
        token: TOKEN,
    },
});

socket.on("connect", () => {
    console.log("CLIENT 1 connected:", socket.id);

    socket.emit("joinRoom", "engineering");
});

socket.on("roomJoined", (data) => {
    console.log("CLIENT 1 joined:", data);

    setTimeout(() => {
        console.log("📤 CLIENT 1 sending room message...");

        socket.emit("roomMessage", {
            roomName: "engineering",
            message: "Hello from Client 1!",
        });
    }, 500);
});

socket.on("receiveRoomMessage", (data) => {
    console.log("CLIENT 1 received:", data);
});