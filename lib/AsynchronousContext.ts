export class AsynchronousContext<R, A> {
  constructor(public readonly execute: (resolve: (value: A) => R) => R) {}

  public changeValue<B>(change: (value: A) => B): AsynchronousContext<R, B> {
    return new AsynchronousContext(resolve => {
      return this.execute((value: A) => {
        const newValue = change(value);
        return resolve(newValue);
      });
    });
  }

  public changeContextAndValue<B>(
    change: (value: A) => AsynchronousContext<R, B>
  ): AsynchronousContext<R, B> {
    return new AsynchronousContext(resolve => {
      return this.execute((value: A) => {
        const newContext = change(value);
        return newContext.execute(resolve);
      });
    });
  }
}
