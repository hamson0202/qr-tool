'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

interface PresentRecord {
  code: string
  totalCount: number
}

export default function PresentQr({
  records,
  backHref,
}: {
  records: PresentRecord[]
  backHref: string
}) {
  const [index, setIndex] = useState(0)
  const total = records.length
  const current = records[index]

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const goNext = useCallback(() => setIndex((i) => Math.min(total - 1, i + 1)), [total])

  // 支援鍵盤操作（方向鍵／空白鍵／Enter），如果播放的裝置有接鍵盤或藍牙掃描槍會更快。
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev])

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-gray-500">還沒有任何盤點資料可以播放</p>
        <Link href={backHref} className="text-blue-600 underline">
          回總覽
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-sm text-gray-500">
        第 <span className="font-bold text-gray-900">{index + 1}</span> 筆，共{' '}
        <span className="font-bold text-gray-900">{total}</span> 筆
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <QRCodeSVG value={current.code} size={280} level="M" marginSize={2} />
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="font-mono text-lg font-bold">{current.code}</div>
        {current.totalCount > 1 && (
          <div className="text-xs text-amber-600">此條碼曾被掃描 {current.totalCount} 次</div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className="rounded-md border border-gray-300 px-5 py-3 text-base font-medium text-gray-700 disabled:opacity-40"
        >
          上一筆
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={index === total - 1}
          className="rounded-md bg-blue-600 px-5 py-3 text-base font-medium text-white disabled:opacity-40"
        >
          下一筆
        </button>
      </div>

      <Link href={backHref} className="text-sm text-gray-500 underline">
        結束播放，回總覽
      </Link>
    </div>
  )
}
