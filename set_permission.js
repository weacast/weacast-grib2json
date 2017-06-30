const fs = require('fs-extra')
const path = require('path')
const os = require('os')

const grib2jsonCommand = process.env.GRIB2JSON ||
  path.join(__dirname, 'bin', os.platform() === 'win32' ? 'grib2json.cmd' : 'grib2json')

// Set command executable
fs.chmodSync(grib2jsonCommand, '754')
