import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/types/socket";
import { Server as IOServer } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO,
) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_ENABLE_SOCKET_IO !== "true"
  ) {
    res.status(204).end();
    return;
  }

  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      socket.on("join", (payload: { userId?: string }) => {
        const userId = payload?.userId;
        if (!userId) return;
        socket.join(`user:${userId}`);
      });
    });

    res.socket.server.io = io;
    globalThis.__io = io;
  }

  res.end();
}
