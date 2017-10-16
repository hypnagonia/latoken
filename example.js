#!/usr/bin/env node

(async function () {
  const Table = require('cli-table')
  const PuppeteerPageTest = require('./lib.js')
  const url = 'http://google.com'
  const p = new PuppeteerPageTest(url)

  try {
    await p.start()

    const isResOk = await p.isPageHttpStatusOk()
    console.log(`Does ${url} page respond OK:`, isResOk)

    const text = 'Россия', timeout = 2000
    try {
      const hasText = await p.hasTextInTime(text, timeout)
      console.log(`Does ${url} page render "${text}" within ${timeout}ms:`, hasText)
    } catch (err) {
      console.error(`${url} page didn't render "${text}" within ${timeout}ms`)
    }

    const performance = await p.getPerfomanceStats()
    console.log(`${url} page performance`, performance)

    console.log('Performance comparison:')

    const previousPerformance = await p.getPreviousPerformanceStats()
    const currentPerformance = await p.getPerfomanceStats()

    const table = new Table({
      head: ['Performance', 'Current, ms', 'Previous, ms', 'Diff, ms']
    })
    Object.keys(currentPerformance).forEach(key => {
      table.push([
        key,
        currentPerformance[key],
        previousPerformance[key],
        currentPerformance[key] - previousPerformance[key]
      ])
    })
    console.log(table.toString())

    await p.stop()
  } catch (err) {
    console.error(err)
    process.exit(0)
  }
})()