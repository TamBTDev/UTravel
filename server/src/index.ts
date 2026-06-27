import "dotenv/config";
import { createServer } from "http";
import app from "./app";
import { initializeSocket } from "./services/socket.service";

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server & Websocket running on http://localhost:${PORT}`);
});
