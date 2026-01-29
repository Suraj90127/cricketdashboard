import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import morgan from "morgan";
// import { updateAdmin } from "./controllers/admin/adminController.js";
// import { updateAdmin } from "./controllers/cronJobs.js";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import subRouteRoutes from "./routes/admin/subAdminRoutes.js";
import downlineRoutes from "./routes/admin/downlineRoutes.js";
import marketAnalizeRoutes from "./routes/admin/marketAnalizeRoutes.js";
import crickeRoute from "./routes/cricketRoutes.js";
import soccerRoutes from "./routes/soccerRoutes.js";
import tennisRoutes from "./routes/tennisRoutes.js";
import betRoute from "./routes/betRoute.js";
import casinoRoutes from './routes/casinoRoutes.js'
import userWithdrowalRoute from "./routes/admin/userWithdrowalRoute.js";



import { cronJobGame1p } from "./controllers/cronJobs.js";
import { setupWebSocket } from "./socket/bettingSocket.js"; // ✅ New file for WebSocket

dotenv.config();
connectDB();
cronJobGame1p();

// updateAdmin()

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174","http://localhost:5175"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.set("trust proxy", true);
app.use(morgan("dev"));

// Routes
app.use("/api", subRouteRoutes);
app.use("/api", downlineRoutes);
app.use("/api", userRoutes);
app.use("/api", betRoute);
app.use("/api", crickeRoute);
app.use("/api", soccerRoutes);
app.use("/api", tennisRoutes);
app.use("/api", marketAnalizeRoutes); // Ensure this import is defined
app.use("/api",casinoRoutes);
app.use("/api", userWithdrowalRoute);

// Static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../dashboard/dist")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../dashboard/dist/index.html"))
);
// app.use(express.static(path.join(__dirname, "../client/dist")));
// app.get("*", (req, res) =>
//   res.sendFile(path.join(__dirname, "../client/dist/index.html"))
// );

// ✅ Setup WebSocket
setupWebSocket(server); // 🧠 Pass server to WebSocket file

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
