let fs = require('fs-extra')
let path = require('path')
let chai = require('chai')
let chailint = require('chai-lint')
let grib2json = require('..')

describe('weacast-grib2json', () => {
  const output = path.join(__dirname, 'data', 'output.json')
  let jsonArray

  before(() => {
    chailint(chai, chai.util)
  })

  it('is CommonJS compatible', () => {
    chai.expect(typeof grib2json).to.equal('function')
  })

  it('generates valid json in memory', () => {
    jsonArray = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'gfs.json')))
    return grib2json(path.join(__dirname, 'data', 'gfs.grib'), {
      verbose: true
    }).then(function (json) {
      // We extract all messages
      chai.expect(json.messages).toExist()
      chai.expect(json.messages.length > 0).beTrue()
      chai.expect(json.messages[0].length > 0).beTrue()
      let data
      json.messages[0].forEach(message => {
        chai.expect(message.key).toExist()
        chai.expect(message.value).toExist()
        if (message.key === 'values') data = message.value
      })
      chai.expect(data).toExist()
      // Check for data
      chai.expect(data.length).to.equal(jsonArray.length)
      chai.expect(data).to.deep.equal(jsonArray)
    })
  })
  // Let enough time to process data
  .timeout(10000)

  it('generates valid json with only data in file', () => {
    jsonArray = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'gfs.json')))
    return grib2json(path.join(__dirname, 'data', 'gfs.grib'), {
      output,
      verbose: true
    }, ['-p', 'values']).then(function (json) {
      // We extract a single key
      chai.expect(json.key).to.equal('values')
      // Check for data
      chai.expect(json.value.length).to.equal(jsonArray.length)
      chai.expect(json.value).to.deep.equal(jsonArray)
      // Check for output
      let jsonOutput = JSON.parse(fs.readFileSync(output))
      chai.expect(json).to.deep.equal(jsonOutput)
    })
  })
  // Let enough time to process data
  .timeout(10000)

  it('generates valid json with only data and limited precision in file', () => {
    jsonArray = jsonArray.map(value => Number(value.toFixed(2)))
    return grib2json(path.join(__dirname, 'data', 'gfs.grib'), {
      output,
      verbose: true,
      precision: 2
    }, ['-p', 'values']).then(function (json) {
      // We extract a single key
      chai.expect(json.key).to.equal('values')
      // Check for data
      chai.expect(json.value.length).to.equal(jsonArray.length)
      chai.expect(json.value).to.deep.equal(jsonArray)
      // Check for output
      let jsonOutput = JSON.parse(fs.readFileSync(output))
      chai.expect(json).to.deep.equal(jsonOutput)
    })
  })
  // Let enough time to process data
  .timeout(10000)

  // Cleanup
  after(() => {
    fs.removeSync(output)
  })
})
