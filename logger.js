const fs = require('fs')
const logFileName = 'log.json'
const _pageHash = Symbol('pageHash')

class PuppeteerPerformanceLogger {
  constructor (pageHash) {
    this.setPageHash(pageHash)
  }

  setPageHash (pageHash) {
    this[_pageHash] = pageHash
  }

  async loadPerformanceStats () {
    return new Promise((resolve, reject) => {
      fs.readFile(logFileName, (err, data) => {
        if (err) {
          reject(err)
          return
        }

        const json = JSON.parse(data)
        resolve(json)
      })
    })
  }

  async getPreviousPerformanceStats () {
    try {
      const data = await this.loadPerformanceStats()
      return data[this[_pageHash]]
    } catch (err) {
    }

    return null
  }

  async savePerformanceStats (stats) {
    return new Promise(async (resolve, reject) => {
      let json = {}
      try {
        json = await this.loadPerformanceStats()
      } catch (err) {
      }
      json[this[_pageHash]] = stats

      fs.writeFile(logFileName, JSON.stringify(json), err => {
        if (err) {
          reject(err)
          return
        }

        resolve()
      })
    })
  }
}

module.exports = PuppeteerPerformanceLogger