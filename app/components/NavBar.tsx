import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import type { SessionPayload } from '@/app/lib/session'

interface CurrentProject {
  id: string
  name: string
}

export default function NavBar({
  session,
  project,
}: {
  session: SessionPayload
  project?: CurrentProject | null
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/projects" className="font-bold text-gray-900">
          QR 盤點系統
        </Link>

        {project && (
          <nav className="flex gap-4 text-sm font-medium">
            <Link href={`/projects/${project.id}/scan`} className="text-gray-700 hover:text-blue-600">
              掃描
            </Link>
            <Link href={`/projects/${project.id}/inventory`} className="text-gray-700 hover:text-blue-600">
              盤點總覽
            </Link>
          </nav>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
        {project && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
            專案：{project.name}
          </span>
        )}
        <Link href="/projects" className="underline hover:text-blue-600">
          切換專案
        </Link>
        <Link href="/users" className="underline hover:text-blue-600">
          使用者管理
        </Link>
        <span>{session.name}</span>
        <form action={logout}>
          <button type="submit" className="text-gray-500 underline hover:text-red-600">
            登出
          </button>
        </form>
      </div>
    </header>
  )
}
