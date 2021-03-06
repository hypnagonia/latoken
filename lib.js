const puppeteer = require('puppeteer')
const PuppeteerPerformanceLogger = require('./logger')
const _isStarted = Symbol('isStarted')
const _logger = Symbol('logger')
const _url = Symbol('url')
const _page = Symbol('page')
const _browser = Symbol('browser')

class PuppeteerPageTest {
  constructor (url) {
    this[_logger] = new PuppeteerPerformanceLogger(url)
    this[_isStarted] = false
    this.setUrl(url)
  }

  setUrl (url) {
    this[_url] = url
    this[_logger].setPageHash(url)
  }

  async start () {
    if (this[_isStarted] === true) {
      throw new Error('the instance is already running')
    }

    this[_browser] = await puppeteer.launch()
    this[_page] = await this[_browser].newPage()
    this[_isStarted] = true
  }

  async stop () {
    if (this[_isStarted] !== true) {
      throw new Error('the instance is not running')
    }

    await this[_browser].close()
    this[_isStarted] = false
  }

  async isPageHttpStatusOk () {
    const res = await this[_page].goto(this[_url])
    return res.ok
  }

  async hasTextInTime (text, timeout) {
    await  this[_page].goto(this[_url])
    await  this[_page].waitFor(
      text => ~document.body.innerText.indexOf(text),
      {timeout},
      text
    )

    return true
  }

  async getPerfomanceStats () {
    await this[_page].goto(this[_url])
    const performance = await this[_page].evaluate(() => performance.timing)

    const stats = {
      totalTimeMs: performance.loadEventEnd - performance.navigationStart,
      fetchingTimeMs: performance.responseEnd - performance.requestStart,
      domRenderTimeMs: performance.loadEventEnd - performance.domLoading
    }

    await this[_logger].savePerformanceStats(stats)
    return stats
  }

  async getPreviousPerformanceStats () {
    return await this[_logger].getPerformanceStats()
  }

}

module.exports = PuppeteerPageTest