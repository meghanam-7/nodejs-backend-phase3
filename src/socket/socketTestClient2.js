const { io } = require("socket.io-client");

const TOKEN = process.env.SOCKET_TOKEN;

const socket = io("http://localhost:3000", {
    auth: {
        token: TOKEN,
    },
});

socket.on("connect", () => {
    console.log("CLIENT 2 connected:", socket.id);

    socket.emit("joinRoom", "engineering");
});

socket.on("roomJoined", (data) => {
    console.log("CLIENT 2 joined:", data);
});

socket.on("receiveRoomMessage", (data) => {
    console.log("CLIENT 2 received:", data);
});