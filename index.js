var fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const logger = require('winston-color')
const compare = require("compare-versions")

const currentDir = process.argv[2]
const pkg = path.join(currentDir, 'package.json')
const version = process.argv[3]
var regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/

if (version === undefined) {
  logger.error('version argument is "undefined"...' )
  return false
}

if (!regex.test(version)) {
  logger.error('invalid argument for version number...')
  return false
}

main()

// ----------------------------------------------------------------------------

async function main () {
  try {
    await checkForPkg()

    logger.info(`${chalk.yellow('package.json')} was found...`)
    logger.info(`writing version ${chalk.green(process.argv[3])} to ${chalk.yellow('package.json')}...`)    
  } catch (err) {
    logger.error(err.message)
  }
}

function checkForPkg () {
  return new Promise (function (resolve, reject) {
    fs.stat(pkg, (err, res) => {
      if (err && err.path === pkg) {
        reject({ message: 'pcakage.json not found...'})
      } else if (err) {
        reject(err.message)
      }

      const p = require(pkg)
      console.log(compare(version, p.version))
      if (compare(version, p.version) <= 0) { return reject({ message: `package.json - argument is lower than previous version -> ${p.version}` }) }

      p.version = process.argv[3]

      fs.writeFile(pkg, JSON.stringify(p, null, 2), () => {
        resolve(pkg)
      })
    })
  })
}
