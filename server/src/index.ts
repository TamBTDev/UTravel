import "dotenv/config";
import { createServer } from "http";
import app from "./app";
import { initializeSocket } from "./services/socket.service";
import { startBookingCronJob } from "./services/booking.cron";

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
initializeSocket(httpServer);

// Khởi động cron job tự động hoàn thành booking quá hạn
startBookingCronJob();

httpServer.listen(PORT, () => {
  console.log(`Server & Websocket running on http://localhost:${PORT}`);
});
