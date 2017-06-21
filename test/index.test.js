let fs = require('fs')
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

  before(() => {
    chailint(chai, chai.util)
  })

  it('is CommonJS compatible', () => {
    chai.expect(typeof grib2json).to.equal('function')
  })

  it('generates valid json', () => {
    let jsonArray = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'gfs.json')))
    return grib2json(path.join(__dirname, 'data', 'gfs.grib'), {
      data: true
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
})
