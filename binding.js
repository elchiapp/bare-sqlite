if (typeof require.addon !== 'function') require.addon = require('require-addon')

module.exports = require.addon('.', __filename)
