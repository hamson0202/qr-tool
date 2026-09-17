'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { connectDB } from '@/app/lib/mongodb'
import { User } from '@/app/models/User'
import { createSession, deleteSession } from '@/app/lib/session'

export interface AuthFormState {
  error?: string
}

// 內部倉庫工具用的簡易門檻：只有知道這組驗證碼的同仁才能註冊帳號或登入，
// 不是真的密碼強度等級的安全機制，只是用來擋外部人誤入系統。
const ACCESS_CODE = 'gjc'

function isValidAccessCode(input: FormDataEntryValue | null) {
  return String(input ?? '').trim().toLowerCase() === ACCESS_CODE
}

export async function login(
  _prevState: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const accessCode = formData.get('accessCode')

  if (!username || !password || !accessCode) {
    return { error: '請輸入帳號、密碼與驗證碼' }
  }

  if (!isValidAccessCode(accessCode)) {
    return { error: '驗證碼錯誤' }
  }

  await connectDB()
  const user = await User.findOne({ username })

  if (!user) {
    return { error: '帳號或密碼錯誤' }
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatches) {
    return { error: '帳號或密碼錯誤' }
  }

  await createSession({
    userId: user._id.toString(),
    username: user.username,
    name: user.name,
  })

  redirect('/projects')
}

export async function register(
  _prevState: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const name = String(formData.get('name') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const accessCode = formData.get('accessCode')

  if (!username || !name || !password || !accessCode) {
    return { error: '請完整填寫帳號、姓名、密碼與驗證碼' }
  }

  if (!isValidAccessCode(accessCode)) {
    return { error: '驗證碼錯誤' }
  }

  if (password.length < 4) {
    return { error: '密碼長度至少需要 4 個字元' }
  }

  await connectDB()

  const existing = await User.findOne({ username })
  if (existing) {
    return { error: '這個帳號已經被註冊過了' }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ username, name, passwordHash })

  await createSession({
    userId: user._id.toString(),
    username: user.username,
    name: user.name,
  })

  redirect('/projects')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
