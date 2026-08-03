import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <main className="flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
      <div className="relative mb-6 group">
        <div className="absolute -inset-1 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
        <img
          alt="logo"
          className="relative h-28 w-28 drop-shadow-lg transition-transform duration-300 group-hover:scale-105 select-none"
          src={electronLogo}
        />
      </div>

      <span className="inline-flex items-center rounded-full bg-cyan-950/60 px-3.5 py-1 text-xs font-semibold text-cyan-400 ring-1 ring-inset ring-cyan-500/30 mb-4">
        Powered by electron-vite &amp; Bun
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
        Build high-performance apps with{' '}
        <span className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          React
        </span>{' '}
        &amp;{' '}
        <span className="bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          TypeScript
        </span>
      </h1>

      <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-md">
        Please try pressing{' '}
        <kbd className="px-2 py-1 text-xs font-mono font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-md shadow-sm">
          F12
        </kbd>{' '}
        to open the developer tools.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href="https://electron-vite.org/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-all duration-200"
        >
          Documentation
        </a>
        <button
          type="button"
          onClick={ipcHandle}
          className="inline-flex items-center justify-center rounded-full bg-slate-800 px-6 py-2.5 text-sm font-semibold text-slate-200 border border-slate-700 shadow-sm hover:bg-slate-700 hover:text-white transition-all duration-200 cursor-pointer"
        >
          Send IPC
        </button>
      </div>

      <Versions />
    </main>
  )
}

export default App
