let fs = require('fs-extra')
let path = require('path')
let chai = require('chai')
let chailint = require('chai-lint')
let grib2json = require('..')

describe('weacast-grib2json', () => {
  const header = {
    discipline: 0,
    gribEdition: 2,
    gribLength: 48676,
    center: 7,
    subcenter: 0,
    refTime: '2017-06-20T00:00:00.000Z',
    significanceOfRT: 1,
    productStatus: 0,
    productType: 1,
    productDefinitionTemplate: 0,
    parameterCategory: 0,
    parameterNumber: 0,
    parameterUnit: 'K',
    genProcessType: 2,
    forecastTime: 0,
    surface1Type: 1,
    surface1Value: 0,
    surface2Type: 255,
    surface2Value: 0,
    gridDefinitionTemplate: 0,
    numberPoints: 65160,
    shape: 6,
    gridUnits: 'degrees',
    resolution: 48,
    winds: 'true',
    scanMode: 0,
    nx: 360,
    ny: 181,
    basicAngle: 0,
    subDivisions: 0,
    lo1: 0,
    la1: 90,
    lo2: 359,
    la2: -90,
    dx: 1,
    dy: 1
  }
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
      data: true, verbose: true
    }).then(function (json) {
      // We extract a single variable
      chai.expect(json.length).to.equal(1)
      // Check for header
      chai.expect(json[0].header).to.deep.equal(header)
      // Check for data
      chai.expect(json[0].data.length).to.equal(jsonArray.length)
      chai.expect(json[0].data).to.deep.equal(jsonArray)
    })
  })
  // Let enough time to process data
  .timeout(10000)

  it('generates valid json in file', () => {
    jsonArray = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'gfs.json')))
    return grib2json(path.join(__dirname, 'data', 'gfs.grib'), {
      data: true,
      output, verbose: true
    }).then(function (json) {
      // We extract a single variable
      chai.expect(json.length).to.equal(1)
      // Check for header
      chai.expect(json[0].header).to.deep.equal(header)
      // Check for data
      chai.expect(json[0].data.length).to.equal(jsonArray.length)
      chai.expect(json[0].data).to.deep.equal(jsonArray)
      // Check for output
      let jsonOutput = JSON.parse(fs.readFileSync(output))
      chai.expect(json).to.deep.equal(jsonOutput)
    })
  })
  // Let enough time to process data
  .timeout(10000)

  it('generates valid json with limited precision in file', () => {
    jsonArray = jsonArray.map(value => Number(value.toFixed(2)))
    return grib2json(path.join(__dirname, 'data', 'gfs.grib'), {
      data: true,
      output, verbose: true,
      precision: 2
    }).then(function (json) {
      // We extract a single variable
      chai.expect(json.length).to.equal(1)
      // Check for header
      chai.expect(json[0].header).to.deep.equal(header)
      // Check for data
      chai.expect(json[0].data.length).to.equal(jsonArray.length)
      chai.expect(json[0].data).to.deep.equal(jsonArray)
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
