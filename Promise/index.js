const id = a => a

const Promise = (action) => {
  const instance = {
    run: (success, failure) => (
      action(success, failure)
    ),

    map: (f) => (
      Promise((resolve, reject) => (
        instance.run(
          (result) => resolve(f(result)),
          (error) => reject(error)
        )
      ))
    ),

    flatten: () => (
      Promise((resolve, reject) => (
        instance.run(
          (result) => result.run(resolve, reject),
          reject
        )
      ))
    ),

    flatMap: (f) => instance.map(f).flatten(),

    bimap: (success, failure) => (
      Promise((resolve, reject) => (
        instance.run(
          (result) => resolve(success(result)),
          (error) => reject(failure(error))
        )
      ))
    ),

    biFlatten: () => (
      Promise((resolve, reject) => (
        instance.run(
          (result) => result.run(resolve, reject),
          (error) => error.run(resolve, reject)
        )
      ))
    ),

    biFlatMap: (success, failure) => (
      instance.bimap(success, failure).biFlatten()
    ),

    then: (success, failure) => (
      Promise((resolve, reject) => {
        const result = instance.run(success, failure)

        if (typeof result.then === 'function') {
          return result.run(resolve, reject)
        } else {
          return resolve(result)
        }
      })
    ),

    catch: (f) => (
      instance.then(id, f)
    )
  }

  return instance
}

Promise.resolve = (value) => (
  Promise((resolve) => resolve(value))
)

Promise.reject = (error) => (
  Promise((_, reject) => reject(error))
)

module.exports = { Promise }
