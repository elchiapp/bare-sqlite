const binding = require('../binding')
const StatementSync = require('./statement-sync')
const errors = require('./errors')

module.exports = class SQLiteDatabaseSync {
  constructor(location, opts = {}) {
    const {
      open = true,
      readOnly = false,
      enableForeignKeyConstraints = true,
      enableDoubleQuotedStringLiterals = false,
      allowExtension = false,
      timeout = 0
    } = opts

    this._location = location
    this._readOnly = readOnly
    this._enableForeignKeyConstraints = enableForeignKeyConstraints
    this._enableDoubleQuotedStringLiterals = enableDoubleQuotedStringLiterals
    this._allowExtension = allowExtension
    this._timeout = timeout

    this._handle = null

    if (open) this.open()
  }

  get isOpen() {
    return this._handle !== null
  }

  get isTransaction() {
    throw errors.NOT_IMPLEMENTED('isTransaction is not implemented')
  }

  open() {
    if (this._handle !== null) {
      throw errors.DATABASE_ALREADY_OPEN('Database is already open')
    }

    try {
      this._handle = binding.open(
        this._location,
        this._readOnly,
        this._enableForeignKeyConstraints,
        this._enableDoubleQuotedStringLiterals,
        this._allowExtension,
        this._timeout
      )
    } catch (err) {
      throw errors.from(err)
    }
  }

  close() {
    if (this._handle === null) {
      throw errors.DATABASE_NOT_OPEN('Database is not open')
    }

    try {
      binding.close(this._handle)
    } catch (err) {
      throw errors.from(err)
    }

    this._handle = null
  }

  [Symbol.dispose]() {
    if (this.isOpen) this.close()
  }

  exec(sql) {
    if (this._handle === null) {
      throw errors.DATABASE_NOT_OPEN('Database is not open')
    }

    try {
      binding.exec(this._handle, sql)
    } catch (err) {
      throw errors.from(err)
    }
  }

  prepare(sql) {
    if (this._handle === null) {
      throw errors.DATABASE_NOT_OPEN('Database is not open')
    }

    return new StatementSync(this, sql)
  }

  query(sql, params = [], mode = 'all') {
    if (!Array.isArray(params)) {
      throw errors.INVALID_ARGUMENT('Query params must be an array')
    }

    validateQueryParams(params)

    const stmt = this.prepare(sql)

    try {
      const bindCount = binding.parameterCount(stmt._handle)
      if (bindCount !== params.length) {
        throw errors.INVALID_ARGUMENT(
          `Bind count mismatch: expected ${bindCount} parameter(s), received ${params.length}`
        )
      }

      switch (mode) {
        case 'run':
          return stmt.run(...params)
        case 'all':
          return stmt.all(...params)
        case 'values':
          return stmt.values(...params)
        case 'get':
          return stmt.get(...params) ?? null
        default:
          throw errors.INVALID_ARGUMENT('Query mode must be run, all, values, or get')
      }
    } finally {
      stmt[Symbol.dispose]()
    }
  }

  function(name, opts, fn) {
    throw errors.NOT_IMPLEMENTED('function is not implemented')
  }

  aggregate(name, opts) {
    throw errors.NOT_IMPLEMENTED('aggregate is not implemented')
  }

  createSession(opts = {}) {
    throw errors.NOT_IMPLEMENTED('createSession is not implemented')
  }

  applyChangeset(changeset, opts = {}) {
    throw errors.NOT_IMPLEMENTED('applyChangeset is not implemented')
  }

  enableLoadExtension(allow) {
    if (this._handle === null) {
      throw errors.DATABASE_NOT_OPEN('Database is not open')
    }

    if (!this._allowExtension) {
      throw errors.LOAD_EXTENSION_DISABLED('Extension loading is disabled')
    }

    try {
      binding.enableLoadExtension(this._handle, !!allow)
    } catch (err) {
      throw errors.from(err)
    }
  }

  loadExtension(path, entryPoint = null) {
    if (this._handle === null) {
      throw errors.DATABASE_NOT_OPEN('Database is not open')
    }

    if (!this._allowExtension) {
      throw errors.LOAD_EXTENSION_DISABLED('Extension loading is disabled')
    }

    try {
      binding.loadExtension(this._handle, path, entryPoint)
    } catch (err) {
      throw errors.from(err)
    }
  }

  backup(destination, opts = {}) {
    throw errors.NOT_IMPLEMENTED('backup is not implemented')
  }

  location(dbName) {
    throw errors.NOT_IMPLEMENTED('location is not implemented')
  }
}

function validateQueryParams(params) {
  for (let i = 0; i < params.length; i++) {
    if (!isSupportedQueryParam(params[i])) {
      throw errors.INVALID_ARGUMENT(`Unsupported query parameter at index ${i}`)
    }
  }
}

function isSupportedQueryParam(value) {
  if (value === null) return true
  if (typeof value === 'string') return true
  if (typeof value === 'bigint') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (ArrayBuffer.isView(value)) return true
  if (value instanceof ArrayBuffer) return true
  return false
}
