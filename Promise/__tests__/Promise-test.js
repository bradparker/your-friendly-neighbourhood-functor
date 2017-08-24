const {describe, it} = require('mocha')
const assert = require('assert')
const {Promise} = require('../')

const id = a => a

describe('Promise', () => {
  describe('Functor', () => {
    describe('Promise(a, b).map(b => c)', () => {
      describe('when Promise resolves', () => (
        it('returns a Promise(a, c)', () => {
          const a = Promise((resolve) => (
            resolve('Foo')
          ))
          const b = a.map(foo => `${foo}Bar`)

          b.run(
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
          const a = Promise((resolve, reject) => (
            reject('Foo')
          ))
          const b = a.map(foo => `${foo}Bar`)

          b.run(
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
    describe('Promise(Promise(a, b)).flatten()', () => {
      it('returns a Promise(a, b)', () => {
        const a = Promise((outerResolve) => (
          outerResolve(Promise((innerResolve) => (
            innerResolve('WOOT')
          )))
        ))
        const b = a.flatten()

        b.run((result) => {
          assert.equal(result, 'WOOT')
        })
      })
    })

    describe('Promise(a, b).flatMap(b => Promise(a, c))', () => {
      describe('when Promise resolves', () => {
        it('returns a Promise(a, c)', () => {
          const a = Promise((resolve) => (
            resolve(2)
          ))
          const b = a.flatMap(n => Promise((resolve) => (
            resolve(n * 6)
          )))

          b.run((result) => {
            assert.equal(result, 12)
          })
        })
      })
    })
  })

  describe('Bifunctor', () => {})

  describe('Bimonad', () => {
    describe('Promise(a, b).biFlatMap(a -> c, b -> d)', () => {
      describe('When Promise resolves', () => {
        it('returns a Promise(c, b)', () => {
          const a = Promise((resolve) => (
            resolve(2)
          ))
          const b = a.biFlatMap(n => Promise((resolve) => (
            resolve(n * 6)
          )))

          b.run((result) => {
            assert.equal(result, 12)
          })
        })
      })

      describe('When Promise rejects', () => {
        it('returns a Promise(a, d)', () => {
          const a = Promise((_, reject) => (
            reject(2)
          ))
          const b = a.biFlatMap(id, n => Promise((resolve) => (
            resolve(n * 6)
          )))

          b.run((result) => {
            assert.equal(result, 12)
          })
        })
      })
    })
  })

  describe('Promise(a, b).then(a => c, b => d)', () => {
    it('behaves like bimap', () => {
      const a = Promise((resolve) => (
        resolve(2)
      ))
      const b = a.then(n => n * 6)

      b.run((result) => {
        assert.equal(result, 12)
      })
    })
  })

  describe('Promise(a, b).then(a => Promise(c), b => Promise(d))', () => {
    it('behaves like biFlatMap', () => {
      const a = Promise((resolve) => (
        resolve(2)
      ))
      const b = a.then(n => Promise((resolve) => (
        resolve(n * 6)
      )))

      b.run((result) => {
        assert.equal(result, 12)
      })
    })
  })

  describe('Promise(a, b).catch(b => c)', () => {
    it('returns a Promise(c, b)', () => {
      const a = Promise((_, reject) => (
        reject('Oh')
      ))
      const b = a.catch(e => `${e} no`)

      b.run((result) => {
        assert.equal(result, 'Oh no')
      })
    })
  })

  describe('Promise(a, b).catch(b => Promise(c))', () => {
    it('returns a Promise(c, b)', () => {
      const a = Promise((_, reject) => (
        reject('Oh')
      ))
      const b = a.catch(e => Promise((resolve) => (
        resolve(`${e}, ok`)
      )))

      b.run((result) => {
        assert.equal(result, 'Oh, ok')
      })
    })
  })
})
