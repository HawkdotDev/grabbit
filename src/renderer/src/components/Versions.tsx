import { useState } from 'react'

function Versions(): React.JSX.Element {
  const [versions] = useState(window.electron.process.versions)

  return (
    <ul className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 rounded-full bg-slate-900 px-6 py-2.5 text-xs font-mono text-slate-400 border border-slate-800 shadow-lg">
      <li className="flex items-center gap-1.5 border-r border-slate-800 pr-4 last:border-0 last:pr-0">
        <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
        <span>Electron v{versions.electron}</span>
      </li>
      <li className="flex items-center gap-1.5 border-r border-slate-800 pr-4 last:border-0 last:pr-0">
        <span className="h-2 w-2 rounded-full bg-amber-400"></span>
        <span>Chromium v{versions.chrome}</span>
      </li>
      <li className="flex items-center gap-1.5 border-r border-slate-800 pr-4 last:border-0 last:pr-0">
        <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
        <span>Node v{versions.node}</span>
      </li>
    </ul>
  )
}

export default Versions
