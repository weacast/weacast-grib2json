# weacast-grib2json

[![Build Status](https://travis-ci.com/weacast/weacast-grib2json.png?branch=master)](https://travis-ci.com/weacast/weacast-grib2json)
[![Code Climate](https://codeclimate.com/github/weacast/weacast-grib2json/badges/gpa.svg)](https://codeclimate.com/github/weacast/weacast-grib2json)
[![Test Coverage](https://codeclimate.com/github/weacast/weacast-grib2json/badges/coverage.svg)](https://codeclimate.com/github/weacast/weacast-grib2json/coverage)
[![Dependency Status](https://img.shields.io/david/weacast/weacast-grib2json.svg?style=flat-square)](https://david-dm.org/weacast/weacast-grib2json)
[![Download Status](https://img.shields.io/npm/dm/grib2json.svg?style=flat-square)](https://www.npmjs.com/package/weacast-grib2json)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fweacast%2Fweacast-grib2json.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fweacast%2Fweacast-grib2json?ref=badge_shield)

A command line utility that decodes [GRIB2](http://en.wikipedia.org/wiki/GRIB) files as JSON.

This utility uses the [`grib_dump`](https://confluence.ecmwf.int/display/ECC/grib_dump) utility, part of the [ecCodes](https://confluence.ecmwf.int/display/ECC/ecCodes+Home) project by ECMWF.

It has been embedded in a NPM package and provides the same features as a [Node.js](https://nodejs.org) CLI or module.

## Installation

**This requires [ecCodes](https://confluence.ecmwf.int/display/ECC/ecCodes+installation) to be installed on your system.**

```
npm install -g weacast-grib2json
```

## Usage

The `weacast-grib2json` CLI has the following options:

```
> weacast-grib2json --help
Usage: index [options] <file>

Options:
  -V, --version                Output the version number
  -o, --output <file>          Output in a file instead of stdout
  -P, --precision <precision>  Limit precision in output file using the given number of digits after the decimal point
                               (default to unlimited precision: -1)
  -v, --verbose                Enable logging to stdout
  -b, --buffer-size <value>    Largest amount of data in bytes allowed on stdout or stderr
  -h, --help                   Display help for command
```

Unknown options are assumed to be options for the underlying `grib_dump` utility and will be forwarded as is.

For example, the following command outputs to stdout the different messages from the GRIB2 file _gfs.grib_:
```
> weacast-grib2json gfs.grib

{ "messages" : [
  [
    {
      "key" : "discipline",
      "value" : 0
    },
    {
      "key" : "editionNumber",
      "value" : 2
    },
    ...
    {
      "key" : "values",
      "value" :
      [
        273.2, 273.2, 273.2, 273.2, 273.2, 273.2, 273.2, 273.2, 273.2, 273.2,
        ...
      ]
    }
    ...
  ]
]}
```

To only output the data values we specify the relevant option to `grib_dump`:
```
> weacast-grib2json -p values gfs.grib

{
  "key" : "values",
  "value" :
  [
    273.2, 273.2, 273.2, 273.2, 273.2, 273.2, 273.2, 273.2, 273.2, 273.2,
    ...
  ]
}
```

The `--buffer-size <value>` (or `-b  <value>` in short) option specify the largest amount of data in bytes allowed on stdout (defaults to 8 MB). Indeed, because the grib_dump utility is called from the Node.js process using [child_process](https://nodejs.org/api/child_process.html), output is retrieved from stdout.

### Using the Docker container

When using the tool as a Docker container the arguments to the CLI have to be provided through the ARGS environment variable, with the data volume required to make input accessible within the container and get output file back the previous example becomes:
```
docker run --name grib2json --rm -v /mnt/data:/usr/local/data -e "ARGS=-p values -o /usr/local/data/output.json /usr/local/data/gfs.grib" weacast/weacast-grib2json
```
You can also override the default command:
```
docker run --name grib2json --rm -v /mnt/data:/usr/local/data weacast/weacast-grib2json weacast-grib2json -p values -o /usr/local/data/output.json /usr/local/data/gfs.grib
```

### As module

Just call the `grib2json` default export function in your code with the required options:
```javascript
const grib2json = require('weacast-grib2json')
// First arg is the input file path, second arg is CLI options as JS object
grib2json('gfs.grib', {
  output: 'output.json'
})
.then(function (json) {
  // Do whatever with the json data, same format as output of the CLI
})
```

Like with the CLI version you can use the additional `bufferSize` option to specify the largest amount of data in bytes allowed on stdout (defaults to 8 MB), notably if you deal with large files. You can also process data only in-memory without writing any file by omitting the output:
```javascript
grib2json('gfs.grib', {
  bufferSize: 128 * 1024 * 1024 // 128 MB
})
.then(function (json) {
  // Do whatever with the json data, same format as output of the CLI
})
```

**Warning: the `precision` option only applies when writing an output, in-memory data will remain floating point values without any precision loss**

You can also specify the adidtional arguments for the `grib_dump` utility:
```javascript
const grib2json = require('weacast-grib2json')
// First arg is the input file path, second arg is CLI options as JS object,
// third arg contains the additional arguments for grib_dump as arguments list
grib2json('gfs.grib', {
  output: 'output.json'
}, ['-p', 'values'])
.then(function (json) {
  // Do whatever with the json data, same format as output of the CLI
})
```

## Build

A Docker file is also provided to get the tool ready to work within a container, from the project root run:
```
docker build -t weacast/weacast-grib2json .
```

## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fweacast%2Fweacast-grib2json.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fweacast%2Fweacast-grib2json?ref=badge_large)
