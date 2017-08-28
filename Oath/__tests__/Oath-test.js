const assert = require('assert')
const {describe, it} = require('mocha')

const {Oath} = require('../')

describe('Oath', () => {
  describe('Functor', () => {
    describe('Oath(a, b).map(b => c)', () => {
      describe('when Oath resolves', () => (
        it('returns an Oath(a, c)', () => {
          const oathA = Oath.resolve('Foo')
          const oathB = oathA.map(foo => `${foo}Bar`)

          oathB.run(
            (result) => (
              assert.equal(result, 'FooBar')
            ),
            (_) => (
              assert(false, 'Should not have been called')
            )
          )
        })
      ))

      describe('when Oath rejects', () => (
        it('returns an Oath(a, b) unmodified', () => {
          const oathA = Oath.reject('Foo')
          const oathB = oathA.map(foo => `${foo}Bar`)

          oathB.run(
            (_) => (
              assert(false, 'Should not have been called')
            ),
            (result) => (
              assert.equal(result, 'Foo')
            )
          )
        })
      ))
    })
  })

  describe('Monad', () => {
    describe('Oath(a, b).flatMap(b => Oath(a, c))', () => {
      describe('when Oath resolves', () => {
        it('returns an Oath(a, c)', () => {
          const oathA = Oath.resolve(2)
          const oathB = oathA.flatMap(n => Oath.resolve(n * 6))

          oathB.run((result) => {
            assert.equal(result, 12)
          })
        })
      })

      describe('when Oath rejects', () => (
        it('returns an Oath(a, b) unmodified', () => {
          const oathA = Oath.reject('Foo')
          const oathB = oathA.flatMap(value => Oath.resolve(`${value}Bar`))

          oathB.run(
            (_) => (
              assert(false, 'Should not have been called')
            ),
            (result) => (
              assert.equal(result, 'Foo')
            )
          )
        })
      ))
    })
  })

  describe('Oath(a, b).catch(b => Oath(c))', () => {
    it('returns an Oath(c, b)', () => {
      const oathA = Oath.reject('Oh')
      const oathB = oathA.catch(error => Oath.resolve(`${error}, ok`))

      oathB.run((result) => (
        assert.equal(result, 'Oh, ok')
      ))
    })
  })
})
