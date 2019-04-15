export class Context<A> {
  constructor(public readonly value: A) {}

  public changevalue<B>(changer: (a: A) => B): Context<B> {
    const newValue = changer(this.value);
    return new Context(newValue);
  }

  public changeContextAndvalue<B>(changer: (a: A) => Context<B>): Context<B> {
    const newContext = changer(this.value);
    return new Context(newContext.value);
  }
}
