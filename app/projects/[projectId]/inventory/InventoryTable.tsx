'use client'

import { useEffect, useState } from 'react'

interface ScanEvent {
  userId: string
  username: string
  name: string
  scannedAt: string
}

interface ScanRecord {
  _id: string
  code: string
  totalCount: number
  scannedBy: ScanEvent[]
  firstScannedAt: string
  lastScannedAt: string
}

const POLL_INTERVAL_MS = 5000

// 特意不用 toLocaleString()：Node.js（伺服器端）跟瀏覽器的 ICU 語言資料不同，
// 同樣的 locale 格式化出來的字串可能有細微差異（例如空白字元），會導致 React hydration mismatch。
// 手動組字串可以保證伺服器端跟瀏覽器端算出來的結果完全一樣。
function formatTime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export default function InventoryTable({
  projectId,
  initialScans,
}: {
  projectId: string
  initialScans: ScanRecord[]
}) {
  const [scans, setScans] = useState<ScanRecord[]>(initialScans)
  // 初始值用 null，避免伺服器渲染時間跟瀏覽器 hydrate 時間不一致造成 React hydration mismatch，
  // 實際時間改在 useEffect（只會在瀏覽器端執行）裡才設定。
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch(`/api/scan?projectId=${projectId}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setScans(data.scans)
          setLastUpdated(new Date())
        }
      } catch {
        // 輪詢失敗（例如暫時斷線）就靜靜跳過，等下一次輪詢再試。
      }
    }

    // 掛載後立刻抓一次最新資料（同時也在這裡第一次設定 lastUpdated），
    // 不在 effect 主體裡直接同步呼叫 setState，避免多觸發一次不必要的 render。
    poll()

    const timer = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [projectId])

  const totalUniqueCodes = scans.length
  const totalScanEvents = scans.reduce((sum, s) => sum + s.totalCount, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        <div>
          共 <span className="font-bold text-gray-900">{totalUniqueCodes}</span> 個不重複條碼／
          累計掃描 <span className="font-bold text-gray-900">{totalScanEvents}</span> 次
        </div>
        <div>
          每 {POLL_INTERVAL_MS / 1000} 秒自動更新，最後更新：
          {lastUpdated ? formatTime(lastUpdated.toISOString()) : '—'}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">條碼</th>
              <th className="px-4 py-2 font-medium">掃描次數</th>
              <th className="px-4 py-2 font-medium">掃描過的人</th>
              <th className="px-4 py-2 font-medium">最後掃描時間</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {scans.map((scan) => {
              const scannerNames = Array.from(new Set(scan.scannedBy.map((e) => e.name)))
              return (
                <tr key={scan._id}>
                  <td className="px-4 py-2 font-mono">{scan.code}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        scan.totalCount > 1
                          ? 'rounded-full bg-amber-100 px-2 py-0.5 text-amber-700'
                          : ''
                      }
                    >
                      {scan.totalCount}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{scannerNames.join('、')}</td>
                  <td className="px-4 py-2 text-gray-500">{formatTime(scan.lastScannedAt)}</td>
                </tr>
              )
            })}

            {scans.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  還沒有任何掃描記錄
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
