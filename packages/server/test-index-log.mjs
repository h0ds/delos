console.log('0: STARTING')

console.log('1: importing dotenv')
import 'dotenv/config'

console.log('2: importing express')
import express from 'express'

console.log('3: importing cors')
import cors from 'cors'

console.log('4: importing http')
import { createServer } from 'http'

console.log('5: importing socket.io')
import { Server } from 'socket.io'

console.log('6: importing services...')
import { acquireSignals, acquireSignalsWithAnalysis } from './dist/services/signalAggregator.js'

console.log('7: importing polymarket...')
import { getFeaturedMarkets as getPolymarketFeatured, getMarketHistory as getPolymarketHistory } from './dist/services/polymarketService.js'

console.log('8: importing kalshi...')
import { getFeaturedMarkets as getKalshiFeatured, getMarketHistory as getKalshiHistory } from './dist/services/kalshiService.js'

console.log('9: importing dataQuality...')
import { validateSignalQuality, getDataQualityMessage } from './dist/services/dataQuality.js'

console.log('10: importing marketBroadcaster...')
import { MarketBroadcaster } from './dist/services/marketBroadcaster.js'

console.log('11: importing config...')
import { config } from './dist/config.js'

console.log('12: ALL IMPORTS SUCCESS')
process.exit(0)
