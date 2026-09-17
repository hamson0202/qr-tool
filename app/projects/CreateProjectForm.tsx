'use client'

import { useActionState } from 'react'
import { createProject } from './actions'

export default function CreateProjectForm() {
  const [state, formAction, pending] = useActionState(createProject, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="name"
          placeholder="例如：2026年9月倉庫盤點"
          required
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-3 text-base focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-md bg-blue-600 px-4 py-3 text-base font-medium text-white disabled:opacity-50"
        >
          {pending ? '建立中...' : '建立'}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  )
}
