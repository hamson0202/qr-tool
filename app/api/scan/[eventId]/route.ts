import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/app/lib/mongodb'
import { Scan, type IScanEvent } from '@/app/models/Scan'
import { getSessionOrNull } from '@/app/lib/dal'

// 刪除掃描頁下方列表裡的某一筆掃描紀錄，用來讓使用者「反悔」剛剛掃錯或手動輸入錯的資料。
export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/scan/[eventId]'>) {
  const session = await getSessionOrNull()
  if (!session) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const { eventId } = await ctx.params

  await connectDB()

  const scan = await Scan.findOne({ 'scannedBy._id': eventId })
  if (!scan) {
    return NextResponse.json({ error: '找不到這筆掃描紀錄（可能已經被刪除了）' }, { status: 404 })
  }

  const event = scan.scannedBy.find((e: IScanEvent) => e._id.toString() === eventId)
  if (!event) {
    return NextResponse.json({ error: '找不到這筆掃描紀錄（可能已經被刪除了）' }, { status: 404 })
  }

  // 只能刪自己掃的，避免不小心動到別人的紀錄。
  if (event.userId.toString() !== session.userId) {
    return NextResponse.json({ error: '只能刪除自己掃描的紀錄' }, { status: 403 })
  }

  const updated = await Scan.findOneAndUpdate(
    { _id: scan._id },
    {
      $pull: { scannedBy: { _id: eventId } },
      $inc: { totalCount: -1 },
    },
    { new: true }
  )

  // 這個條碼如果已經沒有任何人掃過了，整筆文件也一起清掉。
  if (updated && updated.scannedBy.length === 0) {
    await Scan.deleteOne({ _id: updated._id })
  }

  return NextResponse.json({ success: true })
}
