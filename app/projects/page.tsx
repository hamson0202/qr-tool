import Link from 'next/link'
import { verifySession } from '@/app/lib/dal'
import { connectDB } from '@/app/lib/mongodb'
import { Project } from '@/app/models/Project'
import NavBar from '@/app/components/NavBar'
import CreateProjectForm from './CreateProjectForm'

// 手動組字串，跟其他頁面用的邏輯一致，避免不同環境的 toLocaleString 造成顯示差異。
function formatDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default async function ProjectsPage() {
  const session = await verifySession()

  await connectDB()
  const projects = await Project.find().sort({ createdAt: -1 }).lean()

  return (
    <main className="min-h-screen">
      <NavBar session={session} project={null} />
      <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-6">
        <section>
          <h1 className="mb-1 text-xl font-bold">建立新的盤點專案</h1>
          <p className="mb-3 text-sm text-gray-500">
            每次盤點作業請先建立一個新專案，不同專案的掃描資料不會混在一起。
          </p>
          <CreateProjectForm />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium text-gray-700">或加入現有的盤點專案</h2>

          {projects.length === 0 ? (
            <p className="rounded-md border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
              還沒有任何盤點專案
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-gray-100 rounded-md border border-gray-200">
              {projects.map((p) => (
                <li key={p._id.toString()} className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-400">
                      {p.createdByName} 建立於 {formatDate(p.createdAt)}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/projects/${p._id}/scan`}
                      className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white sm:flex-none"
                    >
                      掃描
                    </Link>
                    <Link
                      href={`/projects/${p._id}/inventory`}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 sm:flex-none"
                    >
                      總覽
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
