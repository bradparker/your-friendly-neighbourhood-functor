export class FallibleAsynchronousContext<R, A> {
  constructor(
    private readonly execute: (
      resolve: (value: A) => R,
      reject: (error: Error) => R
    ) => R
  ) {}

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
