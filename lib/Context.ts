export class Context<A> {
  public readonly value: A;

  public constructor(value: A) {
    this.value = value;
  }

  public changeValue<B>(change: (value: A) => B): Context<B> {
    return new Context(change(this.value));
  }

  public changeContextAndValue<B>(
    change: (value: A) => Context<B>
  ): Context<B> {
    return new Context(change(this.value).value);
  }
}
