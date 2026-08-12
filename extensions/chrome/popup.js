document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status')
  const urlInput = document.getElementById('url')
  const addBtn = document.getElementById('add-btn')
  const msgEl = document.getElementById('msg')
  const interceptToggle = document.getElementById('intercept-toggle')

  // Check connection to Grabbit JSON-RPC endpoint
  async function checkHealth() {
    try {
      const res = await fetch('http://127.0.0.1:6800/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'aria2.getVersion',
          params: []
        })
      })
      const data = await res.json()
      if (data.result) {
        statusEl.textContent = 'CONNECTED'
        statusEl.className = 'status-badge'
        return true
      }
    } catch {}
    statusEl.textContent = 'DISCONNECTED'
    statusEl.className = 'status-badge offline'
    return false
  }

  await checkHealth()

  // Load user preferences
  if (chrome?.storage?.local) {
    chrome.storage.local.get(['interceptDownloads'], (res) => {
      interceptToggle.checked = !!res.interceptDownloads
    })
  }

  interceptToggle.addEventListener('change', () => {
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ interceptDownloads: interceptToggle.checked })
    }
  })

  // Autofill current tab URL if it's a downloadable resource
  if (chrome?.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0]
      if (activeTab && activeTab.url && (activeTab.url.startsWith('http') || activeTab.url.startsWith('magnet:'))) {
        const ext = activeTab.url.split('.').pop()?.toLowerCase()
        if (['zip', 'rar', '7z', 'iso', 'exe', 'msi', 'mp4', 'mkv', 'tar', 'gz'].includes(ext || '') || activeTab.url.startsWith('magnet:')) {
          urlInput.value = activeTab.url
        }
      }
    })
  }

  addBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim()
    if (!url) {
      msgEl.textContent = 'Please enter a valid URL'
      msgEl.style.color = '#f87171'
      return
    }

    msgEl.textContent = 'Sending to Grabbit...'
    msgEl.style.color = '#38bdf8'

    try {
      const res = await fetch('http://127.0.0.1:6800/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'aria2.addUri',
          params: [[url]]
        })
      })
      const data = await res.json()
      if (data.result) {
        msgEl.textContent = '✓ Download queued in Grabbit!'
        msgEl.style.color = '#4ade80'
        urlInput.value = ''
      } else {
        msgEl.textContent = data.error?.message || 'Failed to add download'
        msgEl.style.color = '#f87171'
      }
    } catch {
      msgEl.textContent = 'Failed to connect to Grabbit desktop app.'
      msgEl.style.color = '#f87171'
    }
  })
})
