self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/images/logo.png',
      badge: '/images/badge.png',
      data: data.data
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  
  if (event.notification.data && event.notification.data.orderId) {
    // Open the order details page when notification is clicked
    event.waitUntil(
      clients.openWindow(`/dashboard/orders/${event.notification.data.orderId}`)
    )
  }
}) 