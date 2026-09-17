'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          姓名（顯示用）
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium text-gray-700">
          帳號
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          密碼（至少 4 碼）
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="accessCode" className="text-sm font-medium text-gray-700">
          驗證碼
        </label>
        <input
          id="accessCode"
          name="accessCode"
          autoComplete="off"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-base font-medium text-white disabled:opacity-50"
      >
        {pending ? '註冊中...' : '註冊並登入'}
      </button>

      <p className="text-center text-sm text-gray-500">
        已經有帳號？{' '}
        <Link href="/login" className="text-blue-600 underline">
          去登入
        </Link>
      </p>
    </form>
  )
}
