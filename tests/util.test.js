'use strict'

const { isDST } = require('../lib/utils')
const assert = require('assert')

describe('Utility function Tests', function () {
  describe('isDST()', function () {
    it('2020-03-28 is not DST', function () {
      const date = new Date('2020-03-28 12:00:00')
      assert.equal(isDST(date), false)
    })

    it('2020-03-29 is DST', function () {
      const date = new Date('2020-03-29 12:00:00')
      assert.equal(isDST(date), true)
    })

    it('2020-08-01 is DST', function () {
      const date = new Date('2020-08-01 12:00:00')
      assert.equal(isDST(date), true)
    })

    it('2020-10-24 is DST', function () {
      const date = new Date('2020-10-24 12:00:00')
      assert.equal(isDST(date), true)
    })

    it('2020-10-25 is DST at 1am', function () {
      const date = new Date('2020-10-25 01:00:00')
      assert.equal(isDST(date), true)
    })

    it('2020-10-25 is not DST at 12pm', function () {
      const date = new Date('2020-10-25 12:00:00')
      assert.equal(isDST(date), false)
    })

    it('2021-01-01 is not DST', function () {
      const date = new Date('2021-01-01 12:00:00')
      assert.equal(isDST(date), false)
    })
  })
})
