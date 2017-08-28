const {describe, it} = require('mocha')
const assert = require('assert')
const {Identity} = require('../')

describe('Identity', () => {
  describe('Functor', () => {
    describe('Identity(a).map(a => b)', () => {
      it('returns an Identity(b)', () => {
        const a = Identity(2)
        const b = a.map(n => n * 3)

        assert.equal(b.run(), 6)
      })
    })
  })

  describe('Monad', () => {
    describe('Identity(a).flatMap(a => Identity(b))', () => {
      it('returns an Identity(b)', () => {
        const a = Identity(2)
        const b = a.flatMap(n => Identity(n.toString()))

        assert.equal(b.run(), '2')
      })
    })
  })
})
