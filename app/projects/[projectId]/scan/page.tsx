import { notFound } from 'next/navigation'
import { verifySession } from '@/app/lib/dal'
import { connectDB } from '@/app/lib/mongodb'
import { Project } from '@/app/models/Project'
import NavBar from '@/app/components/NavBar'
import QrScanner from './QrScanner'

export default async function ScanPage(props: PageProps<'/projects/[projectId]/scan'>) {
  const session = await verifySession()
  const { projectId } = await props.params

  await connectDB()
  const project = await Project.findById(projectId).lean()
  if (!project) notFound()

  return (
    <main className="min-h-screen">
      <NavBar session={session} project={{ id: projectId, name: project.name }} />
      <div className="mx-auto max-w-md px-4 py-6">
        <h1 className="mb-4 text-center text-xl font-bold">掃描倉庫 QR Code</h1>
        <QrScanner projectId={projectId} />
      </div>
    </main>
  )
}
