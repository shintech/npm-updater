#!/usr/bin/env node

var fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const winston = require('winston')
const compare = require("compare-versions")
const { promisify } = require("util")

const PWD = process.cwd()
const pkg = path.join(PWD, 'package.json')
const version = process.argv[2]

const stat = promisify(fs.stat)
const writeFile = promisify(fs.writeFile)

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console()
  ],

  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
})

var regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/

if (version === undefined) {
  return logger.error('version argument is "undefined"...' )
}

if (!regex.test(version)) {
  return logger.error('invalid argument for version number...')
}

main()

// ----------------------------------------------------------------------------

async function main () {
  let p
  
  try {
    if (await checkForPkg()) {
      logger.info(`${chalk.yellow('package.json')} was found...`)
      p = require(pkg)
    } else {
      throw new Error('package.json was not found')
    }

    if (compare(version, p.version) <= 0) { throw new Error(`package.json - argument ${version} is <= previous version -> ${p.version}`) }

    logger.info(`writing version ${chalk.green(version)} to ${chalk.yellow('package.json')}...`)

    configurePackage(p)
  } catch (err) {
    logger.error(err.message)
  }
}

async function checkForPkg () {
  try {
    await stat(pkg)
    return true
  } catch (err) {
    return false
  }
}

async function configurePackage (_pkg) {
  _pkg.version = process.argv[2]

  await writeFile(pkg, JSON.stringify(_pkg, null, 2))
  logger.info('success...')
}
