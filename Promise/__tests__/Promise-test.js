const assert = require('assert')
const {describe, it} = require('mocha')

const {Promise} = require('../')

describe('Promise', () => {
  describe('Functor', () => {
    describe('Promise(a, b).map(b => c)', () => {
      describe('when Promise resolves', () => (
        it('returns a Promise(a, c)', () => {
          const promiseA = Promise.resolve('Foo')
          const promiseB = promiseA.map(foo => `${foo}Bar`)

          promiseB.run(
            (result) => (
              assert.equal(result, 'FooBar')
            ),
            (_) => (
              assert(false, 'Should not have been called')
            )
          )
        })
      ))

      describe('when Promise rejects', () => (
        it('returns a Promise(a, b) unmodified', () => {
          const promiseA = Promise.reject(new Error('Foo'))
          const promiseB = promiseA.map(foo => `${foo}Bar`)

          promiseB.run(
            (_) => (
              assert(false, 'Should not have been called')
            ),
            (error) => (
              assert.equal(error.message, 'Foo')
            )
          )
        })
      ))
    })
  })

  describe('Monad', () => {
    describe('Promise(a, b).flatMap(b => Promise(a, c))', () => {
      describe('when Promise resolves', () => {
        it('returns a Promise(a, c)', () => {
          const promiseA = Promise.resolve(2)
          const promiseB = promiseA.flatMap(n => Promise.resolve(n * 6))

          promiseB.run((result) => {
            assert.equal(result, 12)
          })
        })
      })

      describe('when Promise rejects', () => (
        it('returns a Promise(a, b) unmodified', () => {
          const promiseA = Promise.reject(new Error('Foo'))
          const promiseB = promiseA.flatMap(value => Promise.resolve(`${value}Bar`))

          promiseB.run(
            (_) => (
              assert(false, 'Should not have been called')
            ),
            (error) => (
              assert.equal(error.message, 'Foo')
            )
          )
        })
      ))
    })
  })

  describe('Promise(a, b).catch(b => c)', () => {
    it('returns a Promise(c, b)', () => {
      const promiseA = Promise.reject(new Error('Oh'))
      const promiseB = promiseA.catch(error => `${error.message}, ok`)

      promiseB.run((result) => (
        assert.equal(result, 'Oh, ok')
      ))
    })
  })

  describe('Promise(a, b).catch(b => Promise(c, b))', () => {
    it('returns a Promise(c, b)', () => {
      const promiseA = Promise.reject(new Error('Oh'))
      const promiseB = promiseA.catch(error => Promise.resolve(`${error.message}, ok`))

      promiseB.run((result) => (
        assert.equal(result, 'Oh, ok')
      ))
    })
  })
})
