# weacast-grib2json

[![Build Status](https://travis-ci.org/weacast/weacast-grib2json.png?branch=master)](https://travis-ci.org/weacast/weacast-grib2json)
[![Code Climate](https://codeclimate.com/github/weacast/weacast-grib2json/badges/gpa.svg)](https://codeclimate.com/github/weacast/weacast-grib2json)
[![Test Coverage](https://codeclimate.com/github/weacast/weacast-grib2json/badges/coverage.svg)](https://codeclimate.com/github/weacast/weacast-grib2json/coverage)
[![Dependency Status](https://img.shields.io/david/weacast/weacast-grib2json.svg?style=flat-square)](https://david-dm.org/weacast/weacast-grib2json)
[![Download Status](https://img.shields.io/npm/dm/grib2json.svg?style=flat-square)](https://www.npmjs.com/package/weacast-grib2json)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fweacast%2Fweacast-grib2json.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fweacast%2Fweacast-grib2json?ref=badge_shield)

A command line utility that decodes [GRIB2](http://en.wikipedia.org/wiki/GRIB) files as JSON.

This utility uses the netCDF-Java GRIB decoder, part of the [THREDDS](https://github.com/Unidata/thredds) project
by University Corporation for Atmospheric Research/Unidata.

It has been embedded in a NPM package and provides the same features as a [Node.js](https://nodejs.org) CLI or module.

## Installation

**This requires Java 8 to be installed on your system and the JAVA_HOME environment variable to be positioned and point to your local Java root directory.**

### Java CLI

```
git clone <this project>
```

The project contains a *bin* folder with the latest version. The *bin* folder contains a `grib2json` CLI script for Linux-based and Windows-based OS, you should add this folder to your PATH.

### Node.js CLI

```
npm install -g weacast-grib2json
```

## Usage

### As CLI

The `grib2json` CLI can be used similarly from the native OS CLI or from Node.

```
> grib2json --help (or node index.js --help)
Usage: grib2json (or node index.js) [options] FILE
	[--compact -c] : enable compact Json formatting
	[--data -d] : print GRIB record data
	[--filter.category --fc value] : select records with this numeric category
	[--filter.parameter --fp value] : select records with this numeric parameter
	[--filter.surface --fs value] : select records with this numeric surface type
	[--filter.value --fv value] : select records with this numeric surface value
	[--help -h] : display this help
	[--names -n] : print names of numeric codes
	[--output -o value] : write output to the specified file (default is stdout)
	[--precision -p value] : limit precision in output file using the given number of digits after the decimal point
    	[--verbose -v] : enable logging to stdout
```

For example, the following command outputs to stdout the records for parameter 2 (U-component_of_wind), with
surface type 103 (Specified height level above ground), and surface value 10.0 meters from the GRIB2 file
_gfs.t18z.pgrbf00.2p5deg.grib2_. Notice the optional inclusion of human-readable _xyzName_ keys and the data array:

```
> grib2json --names --data --fp 2 --fs 103 --fv 10.0 gfs.t18z.pgrbf00.2p5deg.grib2

[
    {
        "header":{
            "discipline":0,
            "disciplineName":"Meteorological products",
            "gribEdition":2,
            "gribLength":27759,
            "center":7,
            "centerName":"US National Weather Service - NCEP(WMC)",
            "parameterNumber":2,
            "parameterNumberName":"U-component_of_wind",
            "parameterUnit":"m.s-1",
            "surface1Type":103,
            "surface1TypeName":"Specified height level above ground",
            "surface1Value":10.0,
            ...
        },
        "data":[
            -2.12,
            -2.27,
            -2.41,
            ...
        ]
    }
]
```

#### Using Node.js

The CLI version has in this case an additional option `--bufferSize <value>`, or `-bs  <value>` in short, specifying the largest amount of data in bytes allowed on stdout (defaults to 8 MB). Indeed, because in this case the Java CLI version is called from the Node.js process using [child_process](https://nodejs.org/api/child_process.html), output is retrieved from stdout.

#### Using the Docker container

When using the tool as a Docker container the arguments to the CLI have to be provided through the ARGS environment variable, with the data volume required to make input accessible within the container and get output file back the previous example becomes:
```
docker run --name grib2json --rm -v /mnt/data:/usr/local/data -e "ARGS=--names --data --fp 2 --fs 103 --fv 10.0 --output /usr/local/data/output.json /usr/local/data/gfs.t18z.pgrbf00.2p5deg.grib2" weacast/grib2json
```

### As module

Just call the `grib2json` default export function in your code:
```javascript
const grib2json = require('weacast-grib2json')
// First arg is the input file path, second arg is CLI options as JS object
grib2json('gfs.grib', {
  data: true,
  output: 'output.json'
})
.then(function (json) {
  // Do whatever with the json data, same format as output of the CLI
})
```

Like with the CLI version you can use the additional `bufferSize` option to specify the largest amount of data in bytes allowed on stdout (defaults to 8 MB), notably if you deal with large files. You can also process data only in-memory without writing any file by omitting the output:
```javascript
grib2json('gfs.grib', {
  data: true,
  bufferSize: 128 * 1024 * 1024 // 128 MB
})
.then(function (json) {
  // Do whatever with the json data, same format as output of the CLI
})
```

## Build

This requires Maven to be installed on your system.

```
git clone <this project>
mvn package
```

This creates a *.tar.gz* in the target directory. Unzip and untar the package in a location of choice.
The package contains a *bin/lib* folders that should be at the same hierarchical level (e.g. in */usr*). The *lib* folder contains all dependent libraries and the execution script set it as current **LIB_PATH** before executing the main jar.

A single **grib2json.jar** file is also generated using the maven plugin for [one-jar](http://one-jar.sourceforge.net/). This is the one used to provide the CLI as a stand-alone archive in the *bin* directory of the project. It is up to you to pick the one you prefer.

A Docker file is also provided to get the tool ready to work within a container, from the project root run:
```
docker build -t weacast/grib2json .
```


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fweacast%2Fweacast-grib2json.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fweacast%2Fweacast-grib2json?ref=badge_large)
