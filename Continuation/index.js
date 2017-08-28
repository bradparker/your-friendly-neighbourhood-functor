const Continuation = (action) => {
  const continuation = {
    run: (done) => action(done),

    map: (f) => (
      Continuation((done) => (
        continuation.run((result) => (
          done(f(result))
        ))
      ))
    ),

    flatMap: (f) => (
      Continuation((done) => (
        continuation.run((result) => (
          f(result).run(done)
        ))
      ))
    )
  }

  return continuation
}

module.exports = { Continuation }
