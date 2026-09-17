import { redirect } from 'next/navigation'
import { getSessionOrNull } from '@/app/lib/dal'

export default async function Home() {
  const session = await getSessionOrNull()
  redirect(session ? '/projects' : '/login')
}
