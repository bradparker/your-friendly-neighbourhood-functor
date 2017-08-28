const Promise = (action) => {
  const promise = {
    run: (success, failure) => (
      action(success, failure)
    ),

    then: (success, failure) => (
      Promise((resolve, reject) => {
        const result = promise.run(success, failure)

        if (typeof result.then === 'function') {
          return result.run(resolve, reject)
        } else {
          return resolve(result)
        }
      })
    ),

    map: (f) => (
      promise.then(f, Promise.reject)
    ),

    flatMap: (f) => (
      promise.then(f, Promise.reject)
    ),

    catch: (f) => (
      promise.then(result => result, f)
    )
  }

  return promise
}

Promise.resolve = (value) => (
  Promise((resolve, _) => resolve(value))
)

Promise.reject = (error) => (
  Promise((_, reject) => reject(error))
)

module.exports = { Promise }
