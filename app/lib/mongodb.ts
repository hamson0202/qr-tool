import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('請在 .env.local 設定 MONGODB_URI 環境變數')
}

// Next.js 開發模式會因為 Hot Reload 重複執行這個檔案，
// 所以用 globalThis 把連線快取起來，避免每次都重新連線 MongoDB。
declare global {
  var _mongooseConn: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  } | undefined
}

const cached = globalThis._mongooseConn ?? { conn: null, promise: null }
globalThis._mongooseConn = cached

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
