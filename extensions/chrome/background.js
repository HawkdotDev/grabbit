/**
 * Grabbit Download Manager Companion - Background Service Worker
 */

const NATIVE_HOST_NAME = 'com.grabbit.host'
const RPC_ENDPOINT = 'http://127.0.0.1:6800/jsonrpc'

// Set up Context Menus on Install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'grabbit-download-link',
    title: 'Download with Grabbit',
    contexts: ['link', 'image', 'video', 'audio', 'selection']
  })
})

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info) => {
  const targetUrl = info.linkUrl || info.srcUrl || info.selectionText
  if (targetUrl) {
    await sendDownloadToGrabbit(targetUrl)
  }
})

// Intercept browser downloads if enabled
chrome.downloads.onCreated.addListener(async (downloadItem) => {
  chrome.storage.local.get(['interceptDownloads'], async (res) => {
    if (res.interceptDownloads && downloadItem.url && !downloadItem.url.startsWith('blob:')) {
      chrome.downloads.cancel(downloadItem.id)
      await sendDownloadToGrabbit(downloadItem.url, downloadItem.filename)
    }
  })
})

/**
 * Sends download URL to Grabbit via Native Messaging or JSON-RPC fallback
 */
async function sendDownloadToGrabbit(url, filename) {
  return new Promise((resolve) => {
    // 1. Try Native Messaging Host
    try {
      chrome.runtime.sendNativeMessage(
        NATIVE_HOST_NAME,
        { action: 'add_download', url, filename },
        (response) => {
          if (chrome.runtime.lastError || !response) {
            // Fallback to HTTP JSON-RPC Gateway
            sendViaJsonRpc(url, filename).then(resolve)
          } else {
            showNotification('Grabbit Downloader', 'Download queued successfully in Grabbit.')
            resolve(response)
          }
        }
      )
    } catch {
      sendViaJsonRpc(url, filename).then(resolve)
    }
  })
}

async function sendViaJsonRpc(url, filename) {
  try {
    const res = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'aria2.addUri',
        params: [[url], filename ? { out: filename } : {}]
      })
    })
    const data = await res.json()
    if (data.result) {
      showNotification('Grabbit Downloader', 'Download added to Grabbit via RPC.')
      return data
    }
  } catch (err) {
    showNotification('Grabbit Connection Error', 'Could not connect to Grabbit. Is the app running?')
  }
  return null
}

function showNotification(title, message) {
  if (chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title,
      message
    })
  }
}
