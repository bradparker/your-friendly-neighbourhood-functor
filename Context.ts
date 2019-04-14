export class Context<A> {
  constructor(private readonly content: A) {}

  public changeContent<B>(changer: (a: A) => B): Context<B> {
    return new Context(changer(this.content));
  }

  public changeContextAndContent<B>(changer: (a: A) => Context<B>): Context<B> {
    return changer(this.content);
  }
}
