const Oath = (action) => {
  const oath = {
    run: (success, failure) => (
      action(success, failure)
    ),

    map: (f) => (
      Oath((resolve, reject) => (
        oath.run(
          (result) => resolve(f(result)),
          (error) => reject(error)
        )
      ))
    ),

    flatMap: (f) => (
      Oath((resolve, reject) => (
        oath.run(
          (result) => f(result).run(resolve, reject),
          (error) => reject(error)
        )
      ))
    ),

    catch: (f) => (
      Oath((resolve, reject) => (
        oath.run(
          (result) => resolve(result),
          (error) => f(error).run(resolve, reject)
        )
      ))
    )
  }

  return oath
}

Oath.resolve = (value) => (
  Oath((resolve, _) => resolve(value))
)

Oath.reject = (error) => (
  Oath((_, reject) => reject(error))
)

module.exports = { Oath }
