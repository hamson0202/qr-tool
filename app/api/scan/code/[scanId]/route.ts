import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/app/lib/mongodb'
import { Scan } from '@/app/models/Scan'
import { getSessionOrNull } from '@/app/lib/dal'

// 刪除盤點總覽裡的整筆條碼紀錄（所有人對這個條碼的掃描次數、紀錄都一起清掉），
// 跟 /api/scan/[eventId] 不一樣：那個只刪單次掃描事件，這個是整個條碼直接砍掉。
export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/scan/code/[scanId]'>) {
  const session = await getSessionOrNull()
  if (!session) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const { scanId } = await ctx.params

  await connectDB()
  const result = await Scan.deleteOne({ _id: scanId })

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: '找不到這筆條碼紀錄（可能已經被刪除了）' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
