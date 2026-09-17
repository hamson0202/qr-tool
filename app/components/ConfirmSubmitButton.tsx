'use client'

import type { ReactNode } from 'react'

// 包在 <form action={serverAction}> 裡面用，送出前先跳原生 confirm 視窗，
// 使用者取消就用 preventDefault() 擋掉這次 submit，避免刪除類操作手滑誤觸。
export default function ConfirmSubmitButton({
  confirmMessage,
  className,
  children,
}: {
  confirmMessage: string
  className?: string
  children: ReactNode
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault()
        }
      }}
    >
      {children}
    </button>
  )
}
