console.log('1: starting')

console.log('2: importing socket.io')
import { Server } from 'socket.io'
console.log('3: socket.io imported')

console.log('4: importing priceHistoryService')
import { fetchOHLCCandles, getCachedCandles, cacheCandles } from './dist/services/priceHistoryService.js'
console.log('5: priceHistoryService imported')

console.log('6: importing MarketBroadcaster')
import { MarketBroadcaster } from './dist/services/marketBroadcaster.js'
console.log('7: MarketBroadcaster imported')

console.log('8: done')
