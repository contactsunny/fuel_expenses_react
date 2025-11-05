// @ts-nocheck
self.addEventListener('install', () => {
  // @ts-ignore
  self.skipWaiting()
})

self.addEventListener('activate', () => {
  // @ts-ignore
  self.clients.claim()
})

import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('install', () => {
  // @ts-ignore
  self.skipWaiting()
})

self.addEventListener('activate', () => {
  // @ts-ignore
  self.clients.claim()
})


