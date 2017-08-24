const {describe, it} = require('mocha')
const assert = require('assert')
const {Continuation} = require('../')

describe('Continuation', () => {
  describe('Continuation(a).run(a => b) -> b', () => {
    it('passes a value to the supplied function and returns its return value', () => {
      const a = Continuation((done) => (
        done(1)
      ))

      const returned = a.run((result) => {
        assert.equal(result, 1)

        return 'We did it!'
      })

      assert.equal(returned, 'We did it!')
    })

    it('can pass its a to the supplied function async', (finished) => {
      const a = Continuation((done) => (
        setTimeout(() => {
          done(1)
        }, 10)
      ))

      a.run((result) => {
        assert.equal(result, 1)
        finished()
      })
    })
  })

  describe('Functor', () => {
    describe('Continuation(a).map(a => b)', () => {
      it('returns a Continuation(b)', () => {
        const a = Continuation((done) => (
          done('Foo')
        ))
        const b = a.map(foo => `${foo}Bar`)

        b.run((result) => (
          assert.equal(result, 'FooBar')
        ))
      })
    })
  })

  describe('Monad', () => {
    describe('Continuation(Continuation(a)).flatten()', () => {
      it('returns a Continuation(a)', () => {
        const a = Continuation((outerDone) => (
          outerDone(Continuation((done) => (
            done('WOOT')
          )))
        ))
        const b = a.flatten()

        b.run((result) => (
          assert.equal(result, 'WOOT')
        ))
      })
    })

    describe('Continuation(a).flatMap(a => Continuation(b))', () => {
      it('returns an Continuation(b)', () => {
        const a = Continuation((done) => (
          done(2)
        ))
        const b = a.flatMap(n => Continuation((done) => (
          done(n * 6)
        )))

        b.run((result) => (
          assert.equal(result, 12)
        ))
      })
    })
  })
})
