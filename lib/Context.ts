export class Context<A> {
  constructor(public readonly value: A) {}

  public changevalue<B>(change: (a: A) => B): Context<B> {
    const newValue = change(this.value);
    return new Context(newValue);
  }

  public changeContextAndvalue<B>(change: (a: A) => Context<B>): Context<B> {
    const newContext = change(this.value);
    return new Context(newContext.value);
  }
}
