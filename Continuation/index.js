const Continuation = (continuation) => {
  const instance = {
    run: (done) => continuation(done),

    map: (f) => (
      Continuation((done) => (
        instance.run((result) => (
          done(f(result))
        ))
      ))
    ),

    flatten: () => (
      Continuation((done) => (
        instance.run((result) => (
          result.run(done)
        ))
      ))
    ),

    flatMap: (f) => instance.map(f).flatten()
  }

  return instance
}

module.exports = { Continuation }
