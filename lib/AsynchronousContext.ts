export class AsynchronousContext<R, A> {
  constructor(public readonly execute: (resolve: (value: A) => R) => R) {}

  public changeValue<B>(change: (value: A) => B): AsynchronousContext<R, B> {
    return new AsynchronousContext(resolve => {
      return this.execute((value: A) => {
        return resolve(change(value));
      });
    });
  }

  public changeContextAndValue<B>(
    change: (value: A) => AsynchronousContext<R, B>
  ): AsynchronousContext<R, B> {
    return new AsynchronousContext(resolve => {
      return this.execute((value: A) => {
        return change(value).execute(resolve);
      });
    });
  }
}
