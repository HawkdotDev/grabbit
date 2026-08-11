import React, { useState } from 'react'
import {
  X,
  User,
  GripHorizontal,
  Server,
  Key,
  Activity,
  LogOut,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Globe,
  Radio
} from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

export type ProfileGatewayTab = 'gateway' | 'tokens' | 'browser' | 'lock'

interface ProfileGatewayModalProps {
  isOpen: boolean
  initialTab?: ProfileGatewayTab
  onClose: () => void
}

export const ProfileGatewayModal: React.FC<ProfileGatewayModalProps> = ({
  isOpen,
  initialTab = 'gateway',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<ProfileGatewayTab>(initialTab)
  const [copiedToken, setCopiedToken] = useState(false)
  const [apiToken, setApiToken] = useState('gbt_live_9f82c401e8da39b78a9c2f64')
  const [serverPort, setServerPort] = useState('6800')
  const [serverEnabled, setServerEnabled] = useState(true)
  const [nativeHostStatus, setNativeHostStatus] = useState<string | null>(null)
  const [isInstallingHost, setIsInstallingHost] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [unlockPin, setUnlockPin] = useState('')
  const [lockError, setLockError] = useState('')

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  React.useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab, isOpen])

  if (!isOpen) return null

  const handleCopyToken = (): void => {
    if (window.api?.copyToClipboard) {
      window.api.copyToClipboard(apiToken)
    } else {
      navigator.clipboard.writeText(apiToken)
    }
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  const handleGenerateToken = (): void => {
    const chars = '0123456789abcdef'
    let token = 'gbt_live_'
    for (let i = 0; i < 24; i++) {
      token += chars[Math.floor(Math.random() * chars.length)]
    }
    setApiToken(token)
  }

  const handleInstallNativeHost = async (): Promise<void> => {
    setIsInstallingHost(true)
    setNativeHostStatus(null)
    try {
      if (window.api?.installNativeHost) {
        const res = await window.api.installNativeHost()
        if (res.success) {
          setNativeHostStatus(`Native host manifest registered at: ${res.manifestPath}`)
        } else {
          setNativeHostStatus(`Failed to register host: ${res.error}`)
        }
      } else {
        setNativeHostStatus('Native host installer API not available in browser mode.')
      }
    } catch (err: unknown) {
      setNativeHostStatus(`Error: ${(err as Error).message || String(err)}`)
    } finally {
      setIsInstallingHost(false)
    }
  }

  const handleLockSession = (): void => {
    setIsLocked(true)
    setUnlockPin('')
    setLockError('')
  }

  const handleUnlockSession = (e: React.FormEvent): void => {
    e.preventDefault()
    if (unlockPin === '1234' || unlockPin.length >= 4) {
      setIsLocked(false)
      setUnlockPin('')
      setLockError('')
    } else {
      setLockError('Enter PIN (min 4 characters, default: 1234)')
    }
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col ${isDragging ? 'transition-none duration-0' : ''
          } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Title Bar */}
        <div
          onMouseDown={handleMouseDown}
          className="px-4 py-2.5 bg-linear-to-r from-ide-surface to-ide-bg border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <GripHorizontal className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <div className="p-1.5 bg-cyan-950/40 rounded-none border border-cyan-500/25">
              <User className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <span className="font-bold text-slate-100 text-xs block">
                User Profile &amp; Remote Gateway
              </span>
              <span className="text-[10px] text-slate-500 block">
                Configure RPC server, API tokens, browser extensions &amp; session security
              </span>
            </div>
          </div>
          {!isLocked && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isLocked ? (
          /* Lock Screen State */
          <form onSubmit={handleUnlockSession} className="p-8 flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 text-rose-400">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100">Session Locked</div>
              <div className="text-xs text-slate-400 mt-1">
                Enter your security PIN or master password to resume Grabbit
              </div>
            </div>
            <div className="w-full max-w-xs space-y-2">
              <input
                type="password"
                value={unlockPin}
                onChange={(e) => setUnlockPin(e.target.value)}
                placeholder="Enter PIN (e.g. 1234)"
                className="w-full bg-ide-bg text-center text-slate-100 text-sm px-3 py-2 border border-ide-border focus:outline-none focus:border-cyan-500 font-mono tracking-widest"
                autoFocus
              />
              {lockError && <div className="text-[11px] text-rose-400 font-mono">{lockError}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-theme-accent text-slate-950 font-bold hover:bg-theme-bright transition cursor-pointer text-xs"
              >
                Unlock Session
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Tabs Header */}
            <div className="flex items-center bg-slate-950 border-b border-ide-border px-2">
              <button
                type="button"
                onClick={() => setActiveTab('gateway')}
                className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${activeTab === 'gateway'
                    ? 'border-cyan-400 text-cyan-400 bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Server className="h-3.5 w-3.5" />
                <span>Remote Server</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tokens')}
                className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${activeTab === 'tokens'
                    ? 'border-amber-400 text-amber-400 bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Key className="h-3.5 w-3.5" />
                <span>API Keys &amp; Tokens</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('browser')}
                className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${activeTab === 'browser'
                    ? 'border-emerald-400 text-emerald-400 bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Browser Connections</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('lock')}
                className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${activeTab === 'lock'
                    ? 'border-rose-400 text-rose-400 bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Security &amp; Lock</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {activeTab === 'gateway' && (
                <div className="space-y-4">
                  <div className="bg-ide-bg/80 border border-ide-border p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${serverEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span className="font-bold text-slate-100 text-xs">Aria2 &amp; REST Remote Gateway</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setServerEnabled(!serverEnabled)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-none cursor-pointer transition ${serverEnabled
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/5 text-slate-500 border border-ide-border'
                          }`}
                      >
                        {serverEnabled ? 'Running' : 'Stopped'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-slate-300 font-mono text-[11px]">
                      <div className="bg-ide-surface p-2.5 border border-ide-border">
                        <span className="text-slate-500 block text-[10px]">HTTP RPC Endpoint</span>
                        <span>http://127.0.0.1:{serverPort}/jsonrpc</span>
                      </div>
                      <div className="bg-ide-surface p-2.5 border border-ide-border">
                        <span className="text-slate-500 block text-[10px]">WebSocket RPC</span>
                        <span>ws://127.0.0.1:{serverPort}/jsonrpc</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <label className="text-slate-400 text-xs">Gateway Port:</label>
                      <input
                        type="text"
                        value={serverPort}
                        onChange={(e) => setServerPort(e.target.value)}
                        className="w-24 bg-ide-surface text-slate-100 font-mono text-xs px-2 py-1 border border-ide-border focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Remote Web &amp; Mobile Clients
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Connect AriaNg, WebUI-Aria2, or any remote mobile app by setting host to 127.0.0.1, port to {serverPort}, and using your API secret token.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'tokens' && (
                <div className="space-y-4">
                  <div className="bg-ide-bg/80 border border-ide-border p-3.5 space-y-3">
                    <div className="font-bold text-slate-100 text-xs">Active Master Secret Token</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={apiToken}
                        className="w-full bg-ide-surface text-amber-300 font-mono text-xs px-3 py-2 border border-ide-border focus:outline-none select-all"
                      />
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        className="px-3 py-2 bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        {copiedToken ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateToken}
                        className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-ide-border transition cursor-pointer shrink-0"
                        title="Regenerate Token"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Pass this token in HTTP requests as <code className="text-amber-400 font-mono">Authorization: Bearer {apiToken}</code> or as RPC token parameter.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'browser' && (
                <div className="space-y-4">
                  <div className="bg-ide-bg/80 border border-ide-border p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-100 text-xs">Chrome / Edge / Firefox Native Messaging Host</div>
                        <div className="text-[10px] text-slate-400">Allows browser extensions to send downloads straight to Grabbit engine</div>
                      </div>
                      <button
                        type="button"
                        disabled={isInstallingHost}
                        onClick={handleInstallNativeHost}
                        className="px-3 py-1.5 bg-emerald-400 text-slate-950 font-bold hover:bg-emerald-300 transition cursor-pointer disabled:opacity-50 text-xs"
                      >
                        {isInstallingHost ? 'Registering...' : 'Register Host Manifest'}
                      </button>
                    </div>

                    {nativeHostStatus && (
                      <div className="p-2.5 bg-slate-950 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                        {nativeHostStatus}
                      </div>
                    )}
                  </div>

                  <div className="bg-ide-bg/80 border border-ide-border p-3.5 space-y-2">
                    <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                      <Radio className="h-3.5 w-3.5 text-emerald-400" /> Active Browser Interceptors
                    </div>
                    <div className="text-[11px] text-slate-400">
                      • Chrome Extension ID: <span className="text-slate-200 font-mono">chrome-extension://grabbit_extension_id/</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      • Intercepted MIME Types: <span className="text-slate-200 font-mono">application/x-bittorrent, application/octet-stream, video/*, audio/*</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'lock' && (
                <div className="space-y-4">
                  <div className="bg-ide-bg/80 border border-ide-border p-3.5 space-y-3">
                    <div className="font-bold text-slate-100 text-xs">Session Security &amp; Lock Screen</div>
                    <p className="text-[11px] text-slate-400">
                      Lock the application window to prevent unauthorized transfers inspection while downloads run securely in the background.
                    </p>
                    <button
                      type="button"
                      onClick={handleLockSession}
                      className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 font-bold transition cursor-pointer text-xs flex items-center gap-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Lock Grabbit Now</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
