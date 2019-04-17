type FallibleCallback<R, A> = (
  resolve: (value: A) => R,
  reject: (error: Error) => R
) => R;

export class FallibleAsynchronousContext<R, A> {
  public readonly execute: FallibleCallback<R, A>;

  public constructor(operation: FallibleCallback<R, A>) {
    this.execute = operation;
  }

  public changeValue<B>(
    change: (value: A) => B
  ): FallibleAsynchronousContext<R, B> {
    return new FallibleAsynchronousContext((resolve, reject) => {
      return this.execute((value: A) => {
        return resolve(change(value));
      }, reject);
    });
  }

  public changeContextAndValue<B>(
    change: (value: A) => FallibleAsynchronousContext<R, B>
  ): FallibleAsynchronousContext<R, B> {
    return new FallibleAsynchronousContext((resolve, reject) => {
      return this.execute((value: A) => {
        return change(value).execute(resolve, reject);
      }, reject);
    });
  }
}
