import mongoose, { Schema, model, models } from 'mongoose'

export interface IUser {
  _id: mongoose.Types.ObjectId
  username: string
  passwordHash: string
  name: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
})

// Next.js 開發模式熱重載時，models 物件不會重置，
// 用 models.User 檢查避免重複註冊同一個 model 而噴錯。
export const User = models.User<IUser> || model<IUser>('User', UserSchema)
