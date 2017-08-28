const Identity = (value) => ({
  run: () => value,

  map: (f) => Identity(f(value)),

  flatMap: (f) => f(value)
})

module.exports = { Identity }
