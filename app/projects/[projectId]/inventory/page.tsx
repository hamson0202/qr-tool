import Link from 'next/link'
import { notFound } from 'next/navigation'
import { verifySession } from '@/app/lib/dal'
import { connectDB } from '@/app/lib/mongodb'
import { Project } from '@/app/models/Project'
import { Scan } from '@/app/models/Scan'
import NavBar from '@/app/components/NavBar'
import InventoryTable from './InventoryTable'

export default async function InventoryPage(props: PageProps<'/projects/[projectId]/inventory'>) {
  const session = await verifySession()
  const { projectId } = await props.params

  await connectDB()
  const project = await Project.findById(projectId).lean()
  if (!project) notFound()

  const scans = await Scan.find({ projectId }).sort({ lastScannedAt: -1 }).lean()
  // lean() 回傳的物件裡有 ObjectId / Date，要序列化成純 JSON 才能傳給 Client Component。
  const initialScans = JSON.parse(JSON.stringify(scans))

  return (
    <main className="min-h-screen">
      <NavBar session={session} project={{ id: projectId, name: project.name }} />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold">盤點總覽：{project.name}</h1>
          <Link
            href={`/projects/${projectId}/inventory/present`}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            開啟 QR Code 播放模式
          </Link>
        </div>
        <InventoryTable projectId={projectId} initialScans={initialScans} />
      </div>
    </main>
  )
}
