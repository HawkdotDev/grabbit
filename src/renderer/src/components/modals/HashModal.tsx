import React, { useState } from 'react'
import { DownloadItem } from '../../../../engine/types'
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

interface HashModalProps {
  download: DownloadItem | null
  isOpen: boolean
  onClose: () => void
  onVerify: (
    id: string,
    expectedHash: string,
    algo: 'md5' | 'sha256' | 'sha512'
  ) => Promise<{ matches: boolean; actualHash: string }>
}

export const HashModal: React.FC<HashModalProps> = ({ download, isOpen, onClose, onVerify }) => {
  const [algo, setAlgo] = useState<'md5' | 'sha256' | 'sha512'>('sha256')
  const [expectedHash, setExpectedHash] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<{ matches: boolean; actualHash: string } | null>(null)

  if (!isOpen || !download) return null

  const handleVerify = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!expectedHash.trim()) return

    setIsVerifying(true)
    setResult(null)

    try {
      const res = await onVerify(download.id, expectedHash.trim(), algo)
      setResult(res)
    } catch {
      setResult({ matches: false, actualHash: 'Error calculating hash' })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 select-none font-sans text-xs">
      <div className="bg-ide-surface border border-ide-border rounded-none w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-ide-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-theme-tint text-theme-accent rounded-none border border-theme-accent/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Checksum Integrity Verifier</h2>
              <p className="text-xs text-slate-400 truncate max-w-xs">{download.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-none transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleVerify} className="p-6 space-y-4">
          {/* Algorithm Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Algorithm</label>
            <div className="grid grid-cols-3 gap-2">
              {(['sha256', 'sha512', 'md5'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAlgo(a)}
                  className={`py-2 px-3 text-xs font-mono font-bold border transition cursor-pointer rounded-none uppercase ${
                    algo === a
                      ? 'bg-theme-accent text-slate-950 border-theme-accent'
                      : 'bg-ide-bg text-slate-400 border-ide-border hover:text-slate-200'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Expected Hash */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Expected Checksum Hash
            </label>
            <input
              type="text"
              required
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
              className="w-full bg-ide-bg text-slate-100 placeholder-slate-600 text-xs px-3.5 py-2.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent font-mono"
            />
          </div>

          {/* Verification Result Banner */}
          {result && (
            <div
              className={`p-3 border rounded-none flex items-start gap-2.5 ${
                result.matches
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}
            >
              {result.matches ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
              )}
              <div className="space-y-1 font-mono text-[11px]">
                <div className="font-bold">
                  {result.matches ? 'Checksum Match Verified!' : 'Checksum Mismatch Detected'}
                </div>
                <div>Calculated: {result.actualHash}</div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-ide-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-none hover:bg-white/5 transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isVerifying || !expectedHash.trim()}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-theme-accent hover:bg-theme-bright active:scale-95 rounded-none shadow-lg shadow-theme-accent/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Verify Integrity</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
