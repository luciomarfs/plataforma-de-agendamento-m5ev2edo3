const assert = require('node:assert/strict')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')

const apiRoot = path.resolve(__dirname, '..')
const databaseDir = path.join(apiRoot, 'src', 'infrastructure', 'database')
const databaseUrl = 'postgresql://test:test@localhost:5432/config_test'

function checkConfig(cwd, { environmentUrl, fileUrl, missing = false } = {}) {
  const env = {
    ...process.env,
    TS_NODE_PROJECT: path.join(apiRoot, 'tsconfig.json'),
  }
  delete env.DATABASE_URL
  if (environmentUrl !== undefined) env.DATABASE_URL = environmentUrl

  const script = `
    const assert = require('node:assert/strict')
    const path = require('node:path')
    const dotenv = require(${JSON.stringify(require.resolve('dotenv'))})
    dotenv.config = (options) => {
      assert.equal(options.path, ${JSON.stringify(path.join(apiRoot, '.env'))})
      const value = ${JSON.stringify(fileUrl) ?? 'undefined'}
      if (process.env.DATABASE_URL === undefined && value !== undefined) {
        process.env.DATABASE_URL = value
      }
      return { parsed: {} }
    }
    const knexfile = ${JSON.stringify(path.join(databaseDir, 'knexfile.ts'))}
    if (${missing}) {
      assert.throws(() => require(knexfile), /DATABASE_URL deve ser definida/)
    } else {
      const config = require(knexfile).default
      const expectedUrl = ${JSON.stringify(environmentUrl ?? fileUrl)}
      for (const name of ['development', 'production']) {
        assert.equal(config[name].connection, expectedUrl)
        assert.equal(config[name].migrations.directory, ${JSON.stringify(path.join(databaseDir, 'migrations'))})
        assert.equal(config[name].seeds.directory, ${JSON.stringify(path.join(databaseDir, 'seeds'))})
      }
      assert.equal(config.development.migrations.extension, 'ts')
      assert.equal(config.production.migrations.extension, 'js')
      const { db } = require(${JSON.stringify(path.join(databaseDir, 'connection.ts'))})
      const url = new URL(expectedUrl)
      assert.equal(db.client.connectionSettings.host, url.hostname)
      assert.equal(db.client.connectionSettings.database, url.pathname.slice(1))
      assert.equal(db.client.connectionSettings.user, url.username)
      assert.equal(db.client.connectionSettings.password, url.password)
      db.destroy().catch((error) => { console.error(error); process.exitCode = 1 })
    }
  `
  const result = spawnSync(process.execPath, [
    '-r', require.resolve('ts-node/register'), '-e', script,
  ], { cwd, env, encoding: 'utf8', timeout: 30000 })
  assert.ifError(result.error)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout, '', 'Database configuration must not log credentials')
}

for (const cwd of [apiRoot, databaseDir, path.resolve(apiRoot, '..', '..')]) {
  test(`loads API .env independently of cwd: ${path.relative(apiRoot, cwd) || '.'}`, () => {
    checkConfig(cwd, { fileUrl: databaseUrl })
  })
}

test('environment DATABASE_URL takes precedence over .env', () => {
  checkConfig(databaseDir, {
    environmentUrl: databaseUrl,
    fileUrl: 'postgresql://file:file@localhost:5432/file_test',
  })
})

test('missing DATABASE_URL produces an explicit configuration error', () => {
  checkConfig(databaseDir, { missing: true })
})

test('blank DATABASE_URL produces an explicit configuration error', () => {
  checkConfig(databaseDir, { environmentUrl: '   ', missing: true })
})
