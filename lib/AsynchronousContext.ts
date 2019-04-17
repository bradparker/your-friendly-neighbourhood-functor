type Callback<R, A> = (resolve: (value: A) => R) => R;

export class AsynchronousContext<R, A> {
  public readonly execute: Callback<R, A>;

  public constructor(operation: Callback<R, A>) {
    this.execute = operation;
  }

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
