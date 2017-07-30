var fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const yaml = require('js-yaml')
const logger = require('winston-color')

const currentDir = process.argv[2]
const pkg = path.join(currentDir, 'package.json')
const config = path.join(currentDir, 'version.yml')
const version = process.argv[3]
var regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/

validate(run)

function run () {
  checkForPkg()
  checkForYaml()
}

function validate (cb) {
  if (version === undefined) {
    handleError('version argument is undefined...')
    handleError('please try again...\n')
    return false
  }

  if (!regex.test(version)) {
    handleError('invalid argument for version number...')
    handleError('please try again...\n')
    return false
  }

  cb()
}

function checkForPkg () {
  fs.stat(pkg, (err, res) => {
    if (err && err.path === pkg) {
      logger.warn('package.json not found...\naborting...\n')
      return
    } else if (err) {
      throw new Error(err)
    }

    const p = require(pkg)
    detailedInfo('package.json')
    p.version = process.argv[3]
    fs.writeFile(pkg, JSON.stringify(p, null, 2))
  })
}

function checkForYaml () {
  try {
    const v = yaml.safeLoad(fs.readFileSync(config, 'utf8'))
    v.version = version

    detailedInfo('version.yml')
    const y = yaml.safeDump(v, {
      'sortkeys': true
    })

    fs.writeFile(config, y)
  } catch (err) {
    if (err && err.path === config) {
      logger.warn('version.yml not found...\naborting...\n')
    } else {
      throw new Error(err)
    }
  }
}

function detailedInfo (file) {
  logger.info(`${chalk.yellow(file)} was found...`)
  logger.info(`writing version ${chalk.green(process.argv[3])} to ${chalk.yellow(file)}...`)
}

function handleError (err) {
  logger.error(err)
}
