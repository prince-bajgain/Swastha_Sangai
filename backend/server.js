import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import { fileURLToPath } from "url";
import path from "path";
import friendshipRouter from "./routes/friendship.route.js";
import donationRouter from "./routes/donation.route.js";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const port = process.env.PORT;
const io = new Server({
  cors: true
});
const users = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const updateOnlineUsers = () => {

  const onlineUserIds = Array.from(users.keys());
  console.log(onlineUserIds);


  io.emit("onlineUsers", onlineUserIds);
};


// Socket Server Part

io.on('connection', (socket) => {
  console.log(`New User Connected ${socket.id}`);

  socket.on("register", (userId) => {

    const existingSocketId = users.get(userId);

    if (existingSocketId && existingSocketId !== socket.id) {
      io.sockets.sockets.get(existingSocketId)?.disconnect(true);
    }

    users.set(userId, socket.id);

    updateOnlineUsers();
  });


  socket.on('outgoing:call', data => {
    const { fromOffer, to } = data;
    const targetSocketId = users.get(to);
    if (targetSocketId) {
      socket.to(targetSocketId).emit('incoming:call', { from: socket.id, offer: fromOffer });
    }

  });

  socket.on("end-call", ({ to }) => {
    io.to(to).emit("call-ended");
});

  socket.on("ice-candidate", ({ candidate, to }) => {
    if (to) {
      socket.to(to).emit("ice-candidate", { candidate });
    }
  });

  socket.on('call:accepted', data => {
    const { answer, to } = data;
    if (to) {
      socket.to(to).emit('incoming:answer', { from: socket.id, answer: answer });
    }

  })

  socket.on("disconnect", () => {
    for (let [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
      }
    }
    updateOnlineUsers();
    console.log("User disconnected", socket.id);
  });

});


app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173","http://192.168.1.139:5173"],
  credentials: true
}));

app.get('/', (req, res) => {
  res.send("Server is running ....")
});

app.use(
  "/profile-pics",
  express.static(path.join(__dirname, "profile-pics"))
);
app.use(
  "/donation-images",
  express.static(path.join(__dirname, "donation-images"))
);
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter);
app.use('/api/friendship', friendshipRouter);
app.use("/api/donations", donationRouter);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
io.listen(5001);
