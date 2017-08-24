const Identity = (value) => {
  const instance = {
    run: () => value,

    map: (f) => Identity(f(value)),

    flatten: () => instance.run(),

    flatMap: (f) => instance.map(f).flatten()
  }

  return instance
}

module.exports = { Identity }
