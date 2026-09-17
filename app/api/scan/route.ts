import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/app/lib/mongodb'
import { Scan } from '@/app/models/Scan'
import { getSessionOrNull } from '@/app/lib/dal'

export async function GET(request: NextRequest) {
  const session = await getSessionOrNull()
  if (!session) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const projectId = request.nextUrl.searchParams.get('projectId')
  if (!projectId) {
    return NextResponse.json({ error: '缺少盤點專案' }, { status: 400 })
  }

  await connectDB()
  const scans = await Scan.find({ projectId }).sort({ lastScannedAt: -1 }).lean()

  return NextResponse.json({ scans })
}

export async function POST(request: NextRequest) {
  const session = await getSessionOrNull()
  if (!session) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const code = typeof body?.code === 'string' ? body.code.trim() : ''
  const projectId = typeof body?.projectId === 'string' ? body.projectId : ''

  if (!projectId) {
    return NextResponse.json({ error: '缺少盤點專案' }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ error: '缺少條碼內容' }, { status: 400 })
  }

  await connectDB()

  const now = new Date()

  // (projectId, code) 是複合唯一值，同一個專案內重複掃描同一個條碼會命中同一筆文件，
  // 用 $inc 累加次數、$push 記錄是誰在什麼時候掃的，藉此把重複掃描「合併」成一筆。
  // 不同專案就算條碼內容一樣，也會各自獨立一筆，不會互相汙染。
  const scan = await Scan.findOneAndUpdate(
    { projectId, code },
    {
      $inc: { totalCount: 1 },
      $push: {
        scannedBy: {
          userId: session.userId,
          username: session.username,
          name: session.name,
          scannedAt: now,
        },
      },
      $set: { lastScannedAt: now },
      $setOnInsert: { firstScannedAt: now },
    },
    { upsert: true, new: true }
  )

  // $push 一定會把新項目加到陣列最後面，所以這裡拿到的就是剛剛新增的那一筆事件。
  const event = scan.scannedBy[scan.scannedBy.length - 1]

  return NextResponse.json({ scan, event })
}
