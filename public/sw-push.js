// EnglishFlow LMS — Service Worker Push Notification Handler
/* eslint-disable no-restricted-globals */

self.addEventListener('push', function (event) {
  let data = {}
  try {
    if (event.data) {
      data = event.data.json()
    }
  } catch (e) {
    try {
      data = { message: event.data ? event.data.text() : 'Bạn có thông báo mới' }
    } catch (_) {
      data = { message: 'Bạn có thông báo mới từ EnglishFlow LMS' }
    }
  }

  const title = data.title || 'EnglishFlow LMS'
  const options = {
    body: data.body || data.message || 'Bạn có thông báo mới từ trung tâm tiếng Anh.',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    data: data.data || { url: '/' },
    vibrate: [100, 50, 100],
    tag: data.tag || 'englishflow-push',
    renotify: true,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const targetUrl = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        // If a window is already open, focus it and navigate
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url && 'focus' in client) {
            client.focus()
            if ('navigate' in client) {
              return client.navigate(targetUrl)
            }
            return
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }
      })
  )
})

