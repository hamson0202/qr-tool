'use server'

import { revalidatePath } from 'next/cache'
import { connectDB } from '@/app/lib/mongodb'
import { User } from '@/app/models/User'
import { verifySession } from '@/app/lib/dal'

export async function deleteUser(userId: string) {
  const session = await verifySession()

  // 頁面上本來就不會給自己的帳號顯示刪除鍵，這裡再擋一次避免被繞過。
  if (session.userId === userId) {
    return
  }

  await connectDB()
  await User.deleteOne({ _id: userId })

  revalidatePath('/users')
}
