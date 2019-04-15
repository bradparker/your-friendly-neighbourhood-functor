import { AsynchronousContext } from "./AsynchronousContext";

describe("AsynchronousContext", () => {
  describe("changeValue", () => {
    it("takes a function that works on normal values, and makes it able to work on AsynchronousContexts", done => {
      const context = new AsynchronousContext(resolve => {
        return setTimeout(() => {
          return resolve("A string of length 21");
        }, 50);
      });

      const normalFunction = jest.fn(
        (value: string): number => {
          return value.length;
        }
      );

      const changedContext = context.changeValue(normalFunction);

      changedContext.execute(changedValue => {
        expect(changedValue).toBe(21);

        return done();
      });
    });
  });
});
