export class FallibleAsynchronousContext<R, A> {
  constructor(
    private readonly execute: (
      resolve: (value: A) => R,
      reject: (error: Error) => R
    ) => R
  ) {}

  public changeValue<B>(
    changer: (value: A) => B
  ): FallibleAsynchronousContext<R, B> {
    return new FallibleAsynchronousContext((resolve, reject) => {
      return this.execute(
        (value: A) => {
          const newValue = changer(value);
          return resolve(newValue);
        },
        (error: Error) => {
          return reject(error);
        }
      );
    });
  }

  public changeContextAndValue<B>(
    changer: (value: A) => FallibleAsynchronousContext<R, B>
  ): FallibleAsynchronousContext<R, B> {
    return new FallibleAsynchronousContext((resolve, reject) => {
      return this.execute(
        (value: A) => {
          const newContext = changer(value);
          return newContext.execute(resolve, reject);
        },
        (error: Error) => {
          return reject(error);
        }
      );
    });
  }
}
