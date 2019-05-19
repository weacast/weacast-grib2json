#!/usr/bin/env node
const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const program = require('commander')
const execFile = require('child_process').execFile
const grib2jsonCommand = process.env.GRIB2JSON ||
  path.join(__dirname, 'bin', os.platform() === 'win32' ? 'grib2json.cmd' : 'grib2json')

var grib2json = function (filePath, options) {
  var numberFormatter = function (key, value) {
    return value.toFixed ? Number(value.toFixed(options.precision)) : value
  }

  let promise = new Promise(function (resolve, reject) {
    let optionsNames = Object.keys(options)
    optionsNames = optionsNames.filter(arg => options[arg] &&
      // These ones are used internally
      arg !== 'bufferSize' && arg !== 'version' && arg !== 'precision')
    let args = []
    optionsNames.forEach(name => {
      if (typeof options[name] === 'boolean') {
        args.push('--' + name)
      } else {
        args.push('--' + name)
        args.push(options[name])
      }
    })
    // Last to come the file name
    args.push(filePath)
    execFile(grib2jsonCommand, args, { maxBuffer: options.bufferSize || 8 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr)
        reject(error)
        return
      }
      if (options.output) {
        fs.readJson(options.output, (error, json) => {
          if (error) {
            reject(error)
            return
          }
          if (options.verbose) console.log('Wrote ' + json[0].data.length + ' points into file.')
          if (options.precision >= 0) {
            fs.writeFile(options.output, JSON.stringify(json, numberFormatter), function (err) {
              if (err) {
                console.error('Writing output file failed : ', err)
                return
              }
              resolve(json)
            })
          } else {
            resolve(json)
          }
        })
      } else {
        let json = JSON.parse(stdout)
        console.log(stdout)
        resolve(json)
      }
    })
  })

  return promise
}

if (require.main === module) {
  program
    .version(require('./package.json').version)
    .usage('[options] <file>')
    .option('-d, --data', 'Print GRIB record data')
    .option('-c, --compact', 'Enable compact Json formatting')
    .option('-fc, --filter.category <value>', 'Select records with this numeric category')
    .option('-fs, --filter.surface <value>', 'Select records with this numeric surface type')
    .option('-fp, --filter.parameter <value>', 'Select records with this numeric parameter')
    .option('-fv, --filter.value <value>', 'Select records with this numeric surface value')
    .option('-n, --names', 'Print names of numeric codes')
    .option('-o, --output <file>', 'Output in a file instead of stdout')
    .option('-p, --precision <precision>', 'Limit precision in output file using the given number of digits after the decimal point', -1)
    .option('-v, --verbose', 'Enable logging to stdout')
    .option('-bs, --bufferSize <value>', 'Largest amount of data in bytes allowed on stdout or stderr')
    .parse(process.argv)

  program.precision = parseInt(program.precision)

  var inputFile = program.args[program.args.length - 1]
  grib2json(inputFile, program.opts())
  .catch(function (err) {
    console.log(err)
  })
} else {
  module.exports = grib2json
}
