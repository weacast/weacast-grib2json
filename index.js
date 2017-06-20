const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const program = require('commander')
const execFile = require('child_process').execFile
const grib2jsonCommand = process.env.GRIB2JSON ||
  path.join(__dirname, 'bin', os.platform() === 'win32' ? 'grib2json.cmd' : 'grib2json')

var grib2json = function (filePath, options) {
  let promise = new Promise(function (resolve, reject) {
    let args = Object.keys(options)
    args = args.filter(arg => options[arg] && arg !== 'version').map(arg => {
      if (typeof options[arg] === 'boolean') {
        return '--' + arg
      } else {
        return '--' + arg + ' ' + options[arg]
      }
    })
    args.push(filePath)
    execFile(grib2jsonCommand, args, { maxBuffer: 8*1024*1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }
      if (options.output) {
        fs.readJson(options.output, (error, json) => {
          if (error) {
            reject(error)
            return
          }
          resolve(json)
        })
      } else {
        resolve(JSON.parse(stdout))
      }
    })
  })

  return promise
}

if (require.main === module) {
  program
    .version(require('./package.json').version)
    .usage('<file> [options]')
    .option('-d, --data', 'Print GRIB record data')
    .option('-c, --compact', 'Enable compact Json formatting')
    .option('-fc, --filter.category <value>', 'Select records with this numeric category')
    .option('-fs, --filter.surface <value>', 'Select records with this numeric surface type')
    .option('-fp, --filter.parameter <value>', 'Select records with this numeric parameter')
    .option('-fv, --filter.value <value>', 'Select records with this numeric surface value')
    .option('-n, --names', 'Print names of numeric codes')
    .option('-o, --output <file>', 'Output in a file instead of stdout')
    .option('-v, --verbose', 'Enable logging to stdout')
    .parse(process.argv)

  var inputFile = program.args[0]
  grib2json(inputFile, program.opts()).then(function (points) {
    if (program.output) {
      if (program.verbose) {
        console.log('Wrote ' + points.length + ' points into file.')
      }
    } else {
      console.log(points)
    }
  })
  .catch(function (err) {
    console.log(err)
  })
} else {
  module.exports = grib2json
}
