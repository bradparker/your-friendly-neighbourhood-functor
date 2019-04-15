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
      return this.execute(
        (value: A) => {
          const newValue = change(value);
          return resolve(newValue);
        },
        (error: Error) => {
          return reject(error);
        }
      );
    });
  }

  public changeContextAndValue<B>(
    change: (value: A) => FallibleAsynchronousContext<R, B>
  ): FallibleAsynchronousContext<R, B> {
    return new FallibleAsynchronousContext((resolve, reject) => {
      return this.execute(
        (value: A) => {
          const newContext = change(value);
          return newContext.execute(resolve, reject);
        },
        (error: Error) => {
          return reject(error);
        }
      );
    });
  }
}
