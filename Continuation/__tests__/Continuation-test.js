const assert = require('assert')
const {describe, it} = require('mocha')

const {Continuation} = require('../')

describe('Continuation', () => {
  describe('Continuation(a).run(a => b)', () => {
    it('takes a function which will be passed the result of the continuation', () => {
      const continuation = Continuation((done) => (
        done(1)
      ))

      continuation.run((result) => (
        assert.equal(result, 1)
      ))
    })

    it('can be async', (finished) => {
      const continuation = Continuation((done) => (
        setTimeout(() => {
          done(1)
        }, 10)
      ))

      continuation.run((result) => {
        assert.equal(result, 1)
        finished()
      })
    })
  })

  describe('Functor', () => {
    describe('Continuation(a).map(a => b)', () => {
      it('returns a Continuation(b)', () => {
        const continuationA = Continuation((done) => (
          done('Foo')
        ))
        const continuationB = continuationA.map(foo => `${foo}Bar`)

        continuationB.run((result) => (
          assert.equal(result, 'FooBar')
        ))
      })
    })
  })

  describe('Monad', () => {
    describe('Continuation(a).flatMap(a => Continuation(b))', () => {
      it('returns an Continuation(b)', () => {
        const continuationA = Continuation((done) => (
          done(2)
        ))
        const continuationB = continuationA.flatMap(n => Continuation((done) => (
          done(n * 6)
        )))

        continuationB.run((result) => (
          assert.equal(result, 12)
        ))
      })
    })
  })
})
