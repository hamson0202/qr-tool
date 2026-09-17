import { notFound } from 'next/navigation'
import { verifySession } from '@/app/lib/dal'
import { connectDB } from '@/app/lib/mongodb'
import { Project } from '@/app/models/Project'
import { Scan } from '@/app/models/Scan'
import NavBar from '@/app/components/NavBar'
import PresentQr from './PresentQr'

export default async function PresentPage(props: PageProps<'/projects/[projectId]/inventory/present'>) {
  const session = await verifySession()
  const { projectId } = await props.params

  await connectDB()
  const project = await Project.findById(projectId).lean()
  if (!project) notFound()

  // 按條碼排序，順序固定，中途離開下次回來還能對得上大概位置。
  const scans = await Scan.find({ projectId }).sort({ code: 1 }).select('code totalCount').lean()
  const records = scans.map((s) => ({ code: s.code, totalCount: s.totalCount }))

  return (
    <main className="min-h-screen">
      <NavBar session={session} project={{ id: projectId, name: project.name }} />
      <div className="mx-auto max-w-md px-4">
        <h1 className="mt-4 text-center text-lg font-bold">QR Code 播放模式</h1>
        <p className="text-center text-xs text-gray-400">給其他系統的掃描機依序讀取用</p>
        <PresentQr records={records} backHref={`/projects/${projectId}/inventory`} />
      </div>
    </main>
  )
}
