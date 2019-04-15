export class Context<A> {
  constructor(public readonly value: A) {}

  public changeValue<B>(change: (value: A) => B): Context<B> {
    return new Context(change(this.value));
  }

  public changeContextAndValue<B>(
    change: (value: A) => Context<B>
  ): Context<B> {
    return change(this.value);
  }
}
