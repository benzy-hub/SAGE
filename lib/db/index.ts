// lib/db/index.ts
import mongoose from "mongoose";
import { initializeModels } from "./models";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoCache: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongoCache || {
  conn: null,
  promise: null,
};

if (!global.mongoCache) {
  global.mongoCache = cached;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log("[MongoDB] Connected successfully");
        initializeModels();
        return mongoose;
      })
      .catch((err) => {
        console.error("[MongoDB] Connection failed:", err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
