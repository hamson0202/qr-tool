'use server'

import { redirect } from 'next/navigation'
import { connectDB } from '@/app/lib/mongodb'
import { Project } from '@/app/models/Project'
import { verifySession } from '@/app/lib/dal'

export interface ProjectFormState {
  error?: string
}

export async function createProject(
  _prevState: ProjectFormState | undefined,
  formData: FormData
): Promise<ProjectFormState> {
  const session = await verifySession()
  const name = String(formData.get('name') ?? '').trim()

  if (!name) {
    return { error: '請輸入盤點專案名稱' }
  }

  await connectDB()

  const project = await Project.create({
    name,
    createdBy: session.userId,
    createdByName: session.name,
  })

  redirect(`/projects/${project._id.toString()}/scan`)
}
