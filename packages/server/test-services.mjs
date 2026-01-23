console.log('1: starting')

console.log('2: importing config')
import { config } from './dist/config.js'
console.log('3: config imported')

console.log('4: importing signalAggregator')
import { acquireSignals } from './dist/services/signalAggregator.js'
console.log('5: signalAggregator imported')

console.log('6: done')
