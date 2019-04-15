export class AsynchronousContext<R, A> {
  constructor(public readonly execute: (resolve: (value: A) => R) => R) {}

  public changeValue<B>(changer: (value: A) => B): AsynchronousContext<R, B> {
    return new AsynchronousContext(resolve => {
      return this.execute((value: A) => {
        const newValue = changer(value);
        return resolve(newValue);
      });
    });
  }

  public changeContextAndValue<B>(
    changer: (value: A) => AsynchronousContext<R, B>
  ): AsynchronousContext<R, B> {
    return new AsynchronousContext(resolve => {
      return this.execute((value: A) => {
        const newContext = changer(value);
        return newContext.execute(resolve);
      });
    });
  }
}
