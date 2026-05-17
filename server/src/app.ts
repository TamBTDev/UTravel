import express, { Application } from "express";
import cors from "cors";
import { corsOptions } from "./config/cors";
import { errorHandler } from "./middlewares/error.middleware";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/users.routes.js";
import hotelsRoutes from "./modules/hotels/hotels.routes.js";

const app: Application = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hotels", hotelsRoutes);

app.use(errorHandler);

export default app;
