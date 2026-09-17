'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const READER_ELEMENT_ID = 'qr-reader'

// 相機鏡頭對著同一張 QR code 時，每秒可能會重複解碼出好幾次一樣的結果，
// 這個時間內（毫秒）如果掃到同一個條碼就直接忽略，避免瘋狂打 API。
// 手動輸入不會套用這個限制，因為那是使用者刻意送出的。
const SAME_CODE_COOLDOWN_MS = 2500

interface MyScanEntry {
  id: string
  code: string
  totalCount: number
  scannedAt: string
  deleting?: boolean
}

// 特意不用 toLocaleString()：跟 InventoryTable 用同一套手動格式化邏輯，維持一致。
function formatTime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// 用 Web Audio API 直接產生一聲「逼」，不用另外準備音檔。
// 掃描成功前使用者已經按過「開啟相機」或送出過表單，頁面已經有過一次互動，
// 瀏覽器的自動播放限制不會擋掉這裡的音效。
function playBeep() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gainNode.gain.value = 0.2

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.15)
    oscillator.onended = () => ctx.close()
  } catch {
    // 少數瀏覽器環境可能不支援或擋掉音效播放，安靜忽略即可，不影響掃描功能。
  }
}

export default function QrScanner({ projectId }: { projectId: string }) {
  const [entries, setEntries] = useState<MyScanEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [manualPending, setManualPending] = useState(false)
  const lastCodeRef = useRef<{ code: string; time: number } | null>(null)

  const submitScan = useCallback(async (code: string) => {
    setError(null)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, projectId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? '掃描失敗')
        return
      }

      playBeep()
      setEntries((prev) => [
        {
          id: data.event._id,
          code: data.scan.code,
          totalCount: data.scan.totalCount,
          scannedAt: data.event.scannedAt,
        },
        ...prev,
      ])
    } catch {
      setError('網路錯誤，請確認連線後再試一次')
    }
  }, [projectId])

  async function handleDelete(entry: MyScanEntry) {
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, deleting: true } : e)))

    try {
      const res = await fetch(`/api/scan/${entry.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? '刪除失敗')
        setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, deleting: false } : e)))
        return
      }
      setEntries((prev) => prev.filter((e) => e.id !== entry.id))
    } catch {
      setError('網路錯誤，刪除失敗，請再試一次')
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, deleting: false } : e)))
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = manualCode.trim()
    if (!code || manualPending) return

    setManualPending(true)
    submitScan(code).finally(() => setManualPending(false))
    setManualCode('')
  }

  useEffect(() => {
    let scanner: import('html5-qrcode').Html5QrcodeScanner | null = null
    let cancelled = false

    async function start() {
      const { Html5QrcodeScanner } = await import('html5-qrcode')
      if (cancelled) return

      scanner = new Html5QrcodeScanner(
        READER_ELEMENT_ID,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      )

      scanner.render(handleScanSuccess, () => {
        // 每個 frame 掃不到條碼都會呼叫這個 callback，屬於正常情況，不用處理。
      })
    }

    async function handleScanSuccess(decodedText: string) {
      const now = Date.now()
      const last = lastCodeRef.current
      if (last && last.code === decodedText && now - last.time < SAME_CODE_COOLDOWN_MS) {
        return
      }
      lastCodeRef.current = { code: decodedText, time: now }
      await submitScan(decodedText)
    }

    start()

    return () => {
      cancelled = true
      if (scanner) {
        scanner.clear().catch(() => {
          // 元件卸載時鏡頭可能已經停止，clear() 失敗可以忽略。
        })
      }
    }
  }, [submitScan])

  return (
    <div className="flex flex-col gap-5">
      <div id={READER_ELEMENT_ID} className="mx-auto w-full max-w-sm overflow-hidden rounded-lg" />

      <form onSubmit={handleManualSubmit} className="flex flex-col gap-2">
        <label htmlFor="manual-code" className="text-sm font-medium text-gray-700">
          條碼太髒或掃不出來？手動輸入
        </label>
        <div className="flex gap-2">
          <input
            id="manual-code"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="輸入條碼內容"
            className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-3 text-base focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!manualCode.trim() || manualPending}
            className="shrink-0 rounded-md bg-blue-600 px-4 py-3 text-base font-medium text-white disabled:opacity-50"
          >
            新增
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-center text-red-700">{error}</div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-gray-700">本次掃描紀錄</h2>

        {entries.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
            還沒有掃描紀錄
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100 rounded-md border border-gray-200">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 px-3 py-3">
                <div className="min-w-0">
                  <div className="break-all font-mono text-sm font-bold">{entry.code}</div>
                  <div className="text-xs text-gray-400">
                    {formatTime(entry.scannedAt)}
                    {entry.totalCount > 1 && (
                      <span className="ml-2 text-amber-600">累計已掃 {entry.totalCount} 次</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(entry)}
                  disabled={entry.deleting}
                  className="shrink-0 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 disabled:opacity-40"
                >
                  {entry.deleting ? '刪除中...' : '刪除'}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="pt-1 text-center text-sm text-gray-500">
          本次共掃描 <span className="font-bold text-gray-900">{entries.length}</span> 筆
        </div>
      </div>
    </div>
  )
}
