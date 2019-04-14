export class AsynchronousContext<R, A> {
  constructor(private readonly operation: (resolve: (value: A) => R) => R) {}

  public execute(resolve: (value: A) => R): R {
    return this.operation(value => {
      return resolve(value);
    });
  }

  public changeValue<B>(changer: (value: A) => B): AsynchronousContext<R, B> {
    return new AsynchronousContext(resolve => {
      return this.operation((value: A) => {
        const newValue = changer(value);
        return resolve(newValue);
      });
    });
  }

  public changeContextAndValue<B>(
    changer: (value: A) => AsynchronousContext<R, B>
  ): AsynchronousContext<R, B> {
    return new AsynchronousContext(resolve => {
      return this.operation((value: A) => {
        const newContext = changer(value);
        return newContext.execute(resolve);
      });
    });
  }
}
