import React, { useState } from 'react'
import { DownloadItem } from '../../../engine/types'
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

interface HashModalProps {
  download: DownloadItem | null
  isOpen: boolean
  onClose: () => void
  onVerify: (
    id: string,
    expectedHash: string,
    algo: 'sha256' | 'md5' | 'sha512'
  ) => Promise<{ matches: boolean; actualHash: string }>
}

export const HashModal: React.FC<HashModalProps> = ({ download, isOpen, onClose, onVerify }) => {
  const [expectedHash, setExpectedHash] = useState('')
  const [algo, setAlgo] = useState<'sha256' | 'md5' | 'sha512'>('sha256')
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<{ matches: boolean; actualHash: string } | null>(null)

  if (!isOpen || !download) return null

  const handleVerify = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsVerifying(true)
    setResult(null)

    try {
      const res = await onVerify(download.id, expectedHash, algo)
      setResult(res)
    } catch (err) {
      console.error(err)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Cryptographic Hash Check</h2>
              <p className="text-xs text-slate-400 truncate max-w-xs">{download.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleVerify} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {(['sha256', 'md5', 'sha512'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAlgo(a)}
                className={`py-2 rounded-xl text-xs font-mono font-bold uppercase transition cursor-pointer border ${
                  algo === a
                    ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Expected Checksum Hash
            </label>
            <input
              type="text"
              required
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              placeholder="Paste SHA-256 / MD5 hash..."
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Result Panel */}
          {result && (
            <div
              className={`p-4 rounded-xl border font-mono text-xs space-y-1.5 ${
                result.matches
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {result.matches ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>HASH MATCHED — File Verified Intact</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span>HASH MISMATCH — Checksum Failed</span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-slate-400 break-all">
                Actual Hash: {result.actualHash}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-95 rounded-xl shadow-lg shadow-cyan-900/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isVerifying ? 'Calculating...' : 'Verify Hash'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
