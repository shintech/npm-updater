const path = require('path')
const chalk = require('chalk')
const currentDir = process.argv[2]
const pkg = path.join(currentDir, 'package.json')
const _package = require(pkg)
var fs = require('fs')

const p = _package

console.log(`writing version ${chalk.green(process.argv[3])} to package.json...`)
p.version = process.argv[3]

function getValues (obj) {
  if (obj !== undefined) {
    let string = ''
    const values = Object.keys(obj)
    values.map(function (value) {
      string += `    "${value}": "${obj[value]}"`
      if (values.indexOf(value) !== values.length - 1) {
        string += ',\n'
      }
    })
    return string
  } else {
    throw new Error('object in package.json is undefined...')
  }
}

var retval = `{
  "name": "${p.name}",
  "version": "${p.version}",
  "main": "${p.main}",
  "license": "${p.license}",
  "repository":"${p.repository}",
  "author": "${p.author}",
  "scripts": {
${getValues(p['scripts'])}
  },
  "devDependencies": {
${getValues(p['devDependencies'])}
  },
  "dependencies": {
${getValues(p['dependencies'])}
  },
  "standard": {
    "globals": [
      "it",
      "describe",
      "beforeEach",
      "afterEach",
      "before",
      "after",
      "Backbone",
      "_",
      "$"
    ]
  },
  "engines": {
    "node": ">=6"
  }
}
 `

fs.writeFile(pkg, retval)
