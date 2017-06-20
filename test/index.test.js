let fs = require('fs')
let path = require('path')
let chai = require('chai')
let chailint = require('chai-lint')
let grib2json = require('..')

describe('weacast-grib2json', () => {
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
    }).then(function (points) {
      chai.expect(points.length).to.equal(jsonArray.length)
      chai.expect(points).to.deep.equal(jsonArray)
    })
  })
})
