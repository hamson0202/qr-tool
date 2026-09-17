import mongoose, { Schema, model, models } from 'mongoose'

export interface IScanEvent {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  username: string
  name: string
  scannedAt: Date
}

export interface IScan {
  _id: mongoose.Types.ObjectId
  projectId: mongoose.Types.ObjectId
  code: string
  totalCount: number
  scannedBy: IScanEvent[]
  firstScannedAt: Date
  lastScannedAt: Date
}

// 每筆掃描事件要有自己的 _id（不加 { _id: false }），
// 這樣「掃描頁下方列表」的手動刪除功能才能精準指定要刪哪一筆。
const ScanEventSchema = new Schema<IScanEvent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  name: { type: String, required: true },
  scannedAt: { type: Date, required: true },
})

// code 的唯一性是「同一個盤點專案內」才要唯一，不同專案可以出現一樣的條碼，
// 所以用 (projectId, code) 複合唯一索引，而不是 code 自己單獨唯一。
// 重複掃描時用 $inc / $push 更新同一筆，而不是新增新文件，藉此達成「合併」。
const ScanSchema = new Schema<IScan>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  code: { type: String, required: true, trim: true },
  totalCount: { type: Number, default: 0 },
  scannedBy: { type: [ScanEventSchema], default: [] },
  firstScannedAt: { type: Date, default: Date.now },
  lastScannedAt: { type: Date, default: Date.now },
})

ScanSchema.index({ projectId: 1, code: 1 }, { unique: true })

export const Scan = models.Scan<IScan> || model<IScan>('Scan', ScanSchema)
