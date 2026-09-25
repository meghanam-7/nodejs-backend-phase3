const dotenv = require("dotenv");
const http = require("http");
const cluster = require("cluster");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const Redis = require("ioredis");

const { authenticateSocket } = require("./middleware/socketAuthMiddleware");

dotenv.config();

const app = require("./app");

const {
    validateProductionConfig,
} = require("./config/productionConfig");

validateProductionConfig();

const PORT = process.env.PORT;
const NUM_WORKERS = 4;

if (cluster.isPrimary) {
    console.log(`Primary process ${process.pid} is running`);
    console.log(`Starting ${NUM_WORKERS} worker processes...`);

    for (let i = 0; i < NUM_WORKERS; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        console.log(
            `Worker ${worker.process.pid} exited. Starting a replacement worker...`
        );

        cluster.fork();
    });

} else {

    const server = http.createServer(app);

    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    // Redis clients for Socket.io multi-worker communication
    const pubClient = new Redis(process.env.REDIS_URL);
    const subClient = pubClient.duplicate();

    pubClient.on("connect", () => {
        console.log(`Socket.io Redis publisher connected - Worker ${process.pid}`);
    });

    pubClient.on("error", (error) => {
        console.error(
            `Socket.io Redis publisher error - Worker ${process.pid}:`,
            error.message
        );
    });

    subClient.on("connect", () => {
        console.log(`Socket.io Redis subscriber connected - Worker ${process.pid}`);
    });

    subClient.on("error", (error) => {
        console.error(
            `Socket.io Redis subscriber error - Worker ${process.pid}:`,
            error.message
        );
    });

    // Enable Redis adapter for cross-worker Socket.io events
    io.adapter(createAdapter(pubClient, subClient));

    // Authenticate every Socket.io connection
    io.use(authenticateSocket);

    io.on("connection", (socket) => {

        console.log(
            `Client ${socket.id} connected to Worker ${process.pid}`
        );

        // Welcome Event
        socket.emit("welcome", {
            message: "Welcome to PlaceMux Real-Time Server!",
        });

        // Send Message
        socket.on("sendMessage", (data) => {
            console.log(
                `📩 Message received from ${socket.id}:`,
                data
            );

            socket.emit("messageReceived", {
                message: `Server received: ${data.message}`,
            });
        });

        // Join Room
        socket.on("joinRoom", (roomName) => {

            socket.join(roomName);

            console.log(
                `${socket.id} joined room: ${roomName} on Worker ${process.pid}`
            );

            socket.emit("roomJoined", {
                message: `Joined room: ${roomName}`,
            });
        });

        // Room Message
        socket.on("roomMessage", ({ roomName, message }) => {

            console.log(
                `📢 Broadcasting message to room ${roomName} from ${socket.id}`
            );

            io.to(roomName).emit("receiveRoomMessage", {
                room: roomName,
                message,
            });
        });

        // Disconnect
        socket.on("disconnect", (reason) => {

            console.log(
                `Client ${socket.id} disconnected from Worker ${process.pid}. Reason: ${reason}`
            );
        });
    });

    // HTTP server tuning
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
    server.requestTimeout = 30000;

    server.listen(PORT, () => {
        console.log(
            `Worker ${process.pid} is running on port ${PORT}`
        );
    });
}