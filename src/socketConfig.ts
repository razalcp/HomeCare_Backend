import { log } from "console";
import { Server as HttpServer } from "http"
import { Server as SocketIoserver } from "socket.io"
import VideoCallModel from "./models/videoCall";


let io: SocketIoserver
let onlineuser: Record<string, string> = {}
function getReceiverSocketId(receiverId: string) {
    console.log(onlineuser[receiverId]);

    return onlineuser[receiverId]
}
const startSocket = (server: HttpServer) => {

    io = new SocketIoserver(server, {
        cors: {
            // origin: "https://home-care-frontend-five.vercel.app",
            origin: `http://localhost:1234`,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        // console.log("A user connected:", socket.id);
        // console.log("Handshake:", socket.handshake.query.userId);
        let userId
        if (socket.handshake.query.userId) {
            userId = socket.handshake.query.userId.toString()
            onlineuser[userId] = socket.id
            console.log("this is online users", onlineuser)

            io.to(onlineuser[userId]).emit("onlineUsers", onlineuser)
        }
        socket.on('sendMessage', (message) => {
            // console.log("msg");

            // console.log("received message at backend", message)
            let receiver = onlineuser[message.receiverId]
            console.log("receiver socket connection", onlineuser[message.receiverId]);

            socket.to(onlineuser[message.receiverId]).emit("sendMessage", message)
        })


        socket.on("outgoing-video-call", (data) => {
            const userSocketId = getReceiverSocketId(data.to);

            if (userSocketId) {
                io.to(userSocketId).emit("incoming-video-call", {
                    _id: data.to,
                    from: data.from,
                    callType: data.callType,
                    doctorName: data.doctorName,
                    doctorImage: data.doctorImage,
                    roomId: data.roomId,
                });
            } else {
                console.log(`Receiver not found for user ID: ${data.to}`);
            }
        });

        socket.on("reject-call", (data) => {
            console.log("call rejected by user", data);

            const friendSocketId = getReceiverSocketId(data.to);
            if (friendSocketId) {
                socket.to(friendSocketId).emit("call-rejected");
            } else {
                console.error(`No socket ID found for the receiver with ID: ${data.to}`);
            }
        });


        socket.on("accept-incoming-call", async (data) => {
            // console.log("accept-incoming-call", data);
            try {
                const friendSocketId = await getReceiverSocketId(data.to);
                if (friendSocketId) {
                    const startedAt = new Date();
                    const videoCall = {
                        doctorId: data.from,
                        userId: data.to,
                        roomId: data.roomId,
                        duration: 0, // Duration will be updated later
                        startedAt,
                        endedAt: null, // Not ended yet
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                    // Save call details to the database 
                    await VideoCallModel.create(videoCall);
                    // console.log("friensSocketId ",friendSocketId);

                    io.to(friendSocketId).emit("accepted-call", { ...data, startedAt });

                } else {
                    console.error(
                        `No socket ID found for the receiver with ID: ${data.to}`
                    );
                }
            } catch (error: any) {
                console.error("Error in accept-incoming-call handler:", error.message);
            }
        });


        socket.on("trainer-call-accept", async (data) => {
            console.log("backend trainer-call-accept ", data);

            const trainerSocket = await getReceiverSocketId(data.trainerId);
            if (trainerSocket) {
                io.to(trainerSocket).emit("trianer-accept", data);
            }
        });

        socket.on("leave-room", (data) => {
            const friendSocketId = getReceiverSocketId(data.to);
            console.log('friendSocketId when leave', friendSocketId, 'data', data.to);
            if (friendSocketId) {
                socket.to(friendSocketId).emit("user-left", data.to);
            }
        });

    })
}

export { startSocket }