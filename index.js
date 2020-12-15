#!/usr/bin/env node
const fs = require('fs-extra')
const program = require('commander')
const execFile = require('child_process').execFile
const grib2jsonCommand = process.env.GRIB2JSON || 'grib_dump'

var grib2json = function (filePath, options, gribDumpArgs = []) {
  var numberFormatter = function (key, value) {
    return (value.toFixed && (options.precision >= 0)) ? Number(value.toFixed(options.precision)) : value
  }

  let promise = new Promise(function (resolve, reject) {
    // Forward additional options to grib_dump by forcing export to JSON
    const args = ['-j'].concat(gribDumpArgs).concat([filePath])
    execFile(grib2jsonCommand, args, { maxBuffer: options.bufferSize || 8 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr)
        reject(error)
        return
      }
      let json = JSON.parse(stdout)
      if (options.verbose && json.messages) {
        json.messages.forEach(message => {
          const data = message.find(entry => entry.key === 'values')
          const header = message.filter(entry => entry.key !== 'values')
          if (data) console.log('Generated ' + data.value.length + ' points in memory for message ', header)
          else console.log('Generated message ', header)
        })
      }
      // Does not make really sense except as CLI
      if (require.main === module) console.log(stdout)
      if (options.output) {
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
  })

  return promise
}

if (require.main === module) {
  program
    .version(require('./package.json').version)
    .usage('[options] <file>')
    .allowUnknownOption()
    .option('-o, --output <file>', 'Output in a file instead of stdout')
    .option('-P, --precision <precision>', 'Limit precision in output file using the given number of digits after the decimal point', -1)
    .option('-v, --verbose', 'Enable logging to stdout')
    .option('-b, --buffer-size <value>', 'Largest amount of data in bytes allowed on stdout or stderr')
    .parse(process.argv)

  program.precision = parseInt(program.precision)
  if (program.bufferSize) program.bufferSize = parseInt(program.bufferSize)
  // Extract input file path
  const inputFile = program.args.pop()
  grib2json(inputFile, program.opts(), program.args)
  .catch(function (err) {
    console.log(err)
  })
} else {
  module.exports = grib2json
}
