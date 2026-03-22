import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import friendshipRouter from "./routes/friendship.route.js";
import donationRouter from "./routes/donation.route.js";
import commentRouter from "./routes/comment.route.js";

import { fileURLToPath } from "url";
import path from "path";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ===============================
// 🔥 CREATE HTTP SERVER
// ===============================
const server = http.createServer(app);

// ===============================
// 🔥 SOCKET.IO SETUP
// ===============================
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.1.139:5173"],
    credentials: true
  }
});

const users = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// 🔥 ONLINE USERS UPDATE
// ===============================
const updateOnlineUsers = () => {
  const onlineUserIds = Array.from(users.keys());
  console.log("Online Users:", onlineUserIds);

  io.emit("onlineUsers", onlineUserIds);
};

// ===============================
// 🔌 SOCKET SERVER
// ===============================
io.on("connection", (socket) => {
  console.log(`🟢 User Connected: ${socket.id}`);

  socket.on("register", (userId) => {
    const existingSocketId = users.get(userId);

    if (existingSocketId && existingSocketId !== socket.id) {
      io.sockets.sockets.get(existingSocketId)?.disconnect(true);
    }

    users.set(userId, socket.id);
    updateOnlineUsers();
  });

  socket.on("outgoing:call", ({ fromOffer, to }) => {
    const targetSocketId = users.get(to);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("incoming:call", {
        from: socket.id,
        offer: fromOffer,
      });
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

  socket.on("call:accepted", ({ answer, to }) => {
    if (to) {
      socket.to(to).emit("incoming:answer", {
        from: socket.id,
        answer,
      });
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
      }
    }

    updateOnlineUsers();
    console.log(`🔴 User Disconnected: ${socket.id}`);
  });
});

// ===============================
// 🧠 MIDDLEWARE
// ===============================
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.1.139:5173"],
    credentials: true,
  })
);

// 🔥 IMPORTANT (for comments socket)
app.set("io", io);

// ===============================
// 📁 STATIC FILES
// ===============================
app.use(
  "/profile-pics",
  express.static(path.join(__dirname, "profile-pics"))
);

app.use(
  "/donation-images",
  express.static(path.join(__dirname, "donation-images"))
);

// ===============================
// 📡 ROUTES
// ===============================
app.get("/", (req, res) => {
  res.send("Server is running ....");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/friendship", friendshipRouter);
app.use("/api/donations", donationRouter);

// 🔥 COMMENT ROUTE
app.use("/api/comments", commentRouter);

// ===============================
// 🚀 START SERVER
// ===============================
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});