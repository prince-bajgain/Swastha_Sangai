import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { fileURLToPath } from "url";
import path from "path";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.1.139:5173"],
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🤖 AI FITNESS RESPONSES
const getFitnessResponse = (message) => {
  const msg = message.toLowerCase();
  
  if (msg.includes("workout") || msg.includes("exercise") || msg.includes("training")) {
    if (msg.includes("beginner")) {
      return "🏋️‍♂️ For beginners, start with: 3x/week full body workouts • Push-ups (3x8-12) • Bodyweight squats (3x12-15) • Planks (3x30-60s) • Light cardio (15-20 mins). Remember to warm up and cool down!";
    } else if (msg.includes("chest")) {
      return "💪 For chest development: • Bench press (4x8-10) • Incline dumbbell press (3x10-12) • Push-ups (3x failure) • Cable flyes (3x12-15). Focus on form over weight!";
    } else if (msg.includes("back")) {
      return "🏋️‍♂️ For a strong back: • Pull-ups/assisted (3x8-12) • Bent over rows (4x8-10) • Lat pulldowns (3x10-12) • Deadlifts (3x5-8). Keep your core tight!";
    } else {
      return "💪 For effective workouts: • Consistency > intensity • Progressive overload is key • Train each muscle group 2x/week • Get 7-9 hours of sleep • Stay hydrated! Need specific workout advice?";
    }
  }
  else if (msg.includes("diet") || msg.includes("food") || msg.includes("eat") || msg.includes("nutrition")) {
    if (msg.includes("protein")) {
      return "🍗 Great protein sources: • Chicken breast (31g/100g) • Eggs (13g/100g) • Greek yogurt (10g/100g) • Lentils (18g/cup) • Tofu (8g/100g). Aim for 1.6-2.2g protein per kg of body weight!";
    } else if (msg.includes("breakfast")) {
      return "🥣 Healthy breakfast ideas: • Oatmeal with berries and nuts • Greek yogurt parfait • Egg white omelette with veggies • Protein smoothie • Whole grain toast with avocado";
    } else {
      return "🥗 Balanced nutrition tips: • Eat whole foods • Include protein in every meal • Don't fear healthy fats • Stay hydrated • Meal prep to stay consistent. Want specific dietary advice?";
    }
  }
  else if (msg.includes("weight loss") || msg.includes("fat loss") || msg.includes("lose weight")) {
    return "⚖️ Effective weight loss strategies: • 300-500 calorie deficit • Prioritize protein (1.6-2g/kg body weight) • Strength train 3-4x/week • 10k steps daily • Sleep 7-9 hours • Stay consistent for 8-12 weeks!";
  }
  else if (msg.includes("muscle") || msg.includes("gain muscle") || msg.includes("bulk")) {
    return "💪 To build muscle: • Calorie surplus of 300-500 • Progressive overload • 1.6-2.2g protein/kg • Train close to failure (RPE 8-9) • 7-9 hours sleep • Be patient - muscle grows slowly!";
  }
  else if (msg.includes("cardio") || msg.includes("running") || msg.includes("aerobic")) {
    return "🏃‍♂️ Cardio recommendations: • 150 mins moderate or 75 mins vigorous weekly • Mix LISS (walking, cycling) and HIIT (sprints, intervals) • Don't skip strength training • Cardio after weights for fat loss • Listen to your body!";
  }
  else if (msg.includes("water") || msg.includes("hydrate")) {
    return "💧 Hydration guide: • Drink 2.7-3.7 liters daily • More if exercising • Water-rich foods count • Thirst means you're already dehydrated • Add lemon or electrolytes for flavor and minerals!";
  }
  else if (msg.includes("sleep") || msg.includes("recovery") || msg.includes("rest")) {
    return "😴 Recovery essentials: • 7-9 hours quality sleep • Active recovery days • Stretching/foam rolling • Proper nutrition • Stress management • Listen to your body - rest when needed!";
  }
  else if (msg.includes("motivation") || msg.includes("give up") || msg.includes("hard")) {
    return "🌟 Stay motivated! • Set small, achievable goals • Track your progress • Find a workout buddy • Celebrate small wins • Remember why you started • Consistency beats intensity! You've got this! 💪";
  }
  else if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    return "👋 Hello! I'm your Fitness AI Coach. Ready to help with workouts, nutrition, or any fitness questions. What would you like to know today? 😊";
  }
  else if (msg.includes("how are you")) {
    return "😊 I'm doing great! Ready to help you crush your fitness goals. What can I help you with today? 💪";
  }
  
  return "💪 Ask me anything about fitness, workouts, nutrition, or wellness! I'm here to help you achieve your goals. What would you like to know?";
};

// ===============================
// 🔌 SOCKET SERVER
// ===============================
io.on("connection", (socket) => {
  console.log(`🟢 User Connected: ${socket.id}`);

  socket.on("register", (userId) => {
    console.log(`User registered: ${userId}`);
  });

  // 💬 CHAT FEATURE
  socket.on("chat:send", (msg) => {
    console.log("Chat message received:", msg);
    const reply = getFitnessResponse(msg);
    console.log("Sending reply:", reply);
    socket.emit("chat:reply", reply);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User Disconnected: ${socket.id}`);
  });
});

// ===============================
// 🧠 MIDDLEWARE
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.1.139:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// ===============================
// 📡 ROUTES
// ===============================
app.get("/", (req, res) => {
  res.json({ message: "Server is running with AI Chat feature!" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", message: "Chat server is running" });
});

// Auth endpoints for frontend
app.get("/api/auth/is-auth", (req, res) => {
  res.json({ 
    message: "User is authenticated",
    user: {
      id: 1,
      fullName: "Test User",
      email: "test@example.com",
      profileImage: null
    }
  });
});

app.get("/api/user/user-data", (req, res) => {
  res.json({ 
    userData: {
      id: 1,
      fullName: "Test User",
      email: "test@example.com",
      profileImage: null
    }
  });
});

app.post("/api/auth/login", (req, res) => {
  res.json({ 
    message: "Login successful",
    user: {
      id: 1,
      fullName: "Test User",
      email: "test@example.com"
    }
  });
});

// ===============================
// 🚀 START SERVER
// ===============================
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`🔌 Socket.IO server is ready with AI Chat feature`);
  console.log(`🤖 AI Fitness Coach is online!`);
  console.log(`✅ Auth endpoints: /api/auth/is-auth, /api/user/user-data`);
});