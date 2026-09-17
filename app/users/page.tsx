import { verifySession } from '@/app/lib/dal'
import { connectDB } from '@/app/lib/mongodb'
import { User } from '@/app/models/User'
import NavBar from '@/app/components/NavBar'
import ConfirmSubmitButton from '@/app/components/ConfirmSubmitButton'
import { deleteUser } from './actions'

// 手動組字串，跟其他頁面用的邏輯一致，避免不同環境的 toLocaleString 造成顯示差異。
function formatDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`
}

export default async function UsersPage() {
  const session = await verifySession()

  await connectDB()
  const users = await User.find().sort({ createdAt: 1 }).lean()

  return (
    <main className="min-h-screen">
      <NavBar session={session} project={null} />
      <div className="mx-auto max-w-md px-4 py-6">
        <h1 className="mb-1 text-xl font-bold">使用者管理</h1>
        <p className="mb-4 text-sm text-gray-500">目前共 {users.length} 個帳號</p>

        <ul className="flex flex-col divide-y divide-gray-100 rounded-md border border-gray-200">
          {users.map((u) => {
            const isSelf = u._id.toString() === session.userId
            return (
              <li key={u._id.toString()} className="flex items-center justify-between gap-3 px-3 py-3">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">
                    {u.name}
                    {isSelf && <span className="ml-1 text-xs text-gray-400">（你自己）</span>}
                  </div>
                  <div className="text-xs text-gray-400">
                    帳號：{u.username}・建立於 {formatDate(u.createdAt)}
                  </div>
                </div>

                {!isSelf && (
                  <form action={deleteUser.bind(null, u._id.toString())}>
                    <ConfirmSubmitButton
                      confirmMessage={`確定要刪除帳號「${u.name}（${u.username}）」嗎？這個動作無法復原。`}
                      className="shrink-0 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600"
                    >
                      刪除
                    </ConfirmSubmitButton>
                  </form>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}
