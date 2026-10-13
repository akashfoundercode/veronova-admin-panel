import { useState, useEffect } from 'react'

export function useToast() {
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(null), 2200)
      return () => clearTimeout(t)
    }
  }, [msg])
  const node = msg && (
    <div className="fixed bottom-6 right-6 z-[60] rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-xl">
      {msg}
    </div>
  )
  return [setMsg, node]
}

export default useToast

