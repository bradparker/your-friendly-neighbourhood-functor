```
    ____                       _
   / __ \_________  ____ ___  (_)_______  _____
  / /_/ / ___/ __ \/ __ `__ \/ / ___/ _ \/ ___/
 / ____/ /  / /_/ / / / / / / (__  )  __(__  )
/_/   /_/   \____/_/ /_/ /_/_/____/\___/____/

Your friendly neighbourhood Functor
```

---

# What are Promises?

---

# What are Promises?

A Promise is an object that is used as a placeholder for the eventual results
of a deferred (and possibly asynchronous) computation.

From the [ECMA 262 Section on Promises](https://tc39.github.io/ecma262/#sec-promise-objects)

---

# What are Promises?

A Promise is a placeholder for the eventual result of an asynchronous operation.

---

# What are Promises?

A Promise is a placeholder for the eventual _result_ of an asynchronous operation.

---

# What are Promises?

A Promise is a placeholder for the eventual _value_ of an asynchronous operation.

---

# What are Promises?

A Promise is a placeholder for the eventual _value_ of an asynchronous operation
_which can fail_.

---

# What are Promises?

A value in a fallible, asynchronous context.

---

# What are Promises?

A fallible, asynchronous context containing a value.

---

# What are Promises?

A fallible, asynchronous context containing a value (**A**).

---

# What are Promises?

```
FallibleAsynchronousContext<A>
```

---

# When are they used and why?

Let's imagine we have to write a HTTP API request handler which does the
following:

* Decodes a token from the Authorization header into a Claims object
* Authorizes the user represented by the userId on Claims attribute to make
  changes to the article represented by the slug url parameter
* Parses the JSON-encoded request body into an RequestAttributes object
* Validates the supplied RequestAttributes to produce a ValidAttributes object
* Updates the Article with the ValidAttributes
* Responds with the updated Article

---

# When are they used and why?

IT'S OK WE'RE GOING TO CHEAT LIKE NOTHING ELSE!!!

---

# What are we going to do?

---

# What are we going to do?

A sketch

```typescript
import { authorize, decode, update, validate } from "./articles";
import { decodeToken } from "./auth";

const handler = ({
  headers: { Authorization: authorization },
  urlParams: { slug },
  body
}: Request): Promise<Response> =>
  decodeToken(authorization)
    .then(userId => authorize(slug, userId))
    .then(() => {
      const requestAttributes = decode(body);
      return validate(slug, requestAttributes);
    })
    .then(validAttributes => update(slug, validAttributes))
    .then(updatedArticle => respondSuccess(updatedArticle))
    .catch(error => respondFailure(error));
```

---

# What are we going to do?

A sketch (with async / await)

```typescript
import { authorize, decode, update, validate } from "./articles";
import { decodeToken } from "./auth";

const handler = async ({
  headers: { Authorization: authorization },
  urlParams: { slug },
  body
}: Request): Promise<Response> => {
  try {
    const userId = await decodeToken(authorization);
    const requestAttributes = decode(body);
    const validAttributes = await validate(slug, requestAttributes);
    const updatedArticle = await update(slug, validAttributes);
    return respondSuccess(updatedArticle);
  } catch (error) {
    return respondFailure(error);
  }
};
```

---

# What are we going to do?

We're going to be given these functions

```typescript
decodeToken    : (authorization: string)                      => Promise<string>

authorize      : (slug: string, userId: string)               => Promise<void>

decode         : (body: string)                               =>         RequestAttributes

validate       : (requestAttrs : RequestAttributes)           => Promise<ValidAttributes>

update         : (slug: string, validAttrs : ValidAttributes) => Promise<Article>

respondSuccess : (article: Article)                           =>         Response

respondFailure : (error: Error)                               =>         Response
```

---

# What are we going to do?

We just have to define the

```typescript
Promise<A>
```

type that four of them return, and the

```typescript
Promise<A>.then<B>(
  success: (value: A)     => B | Promise<B>,
  failure: (error: Error) => B | Promise<B>
): Promise<B>
```

method that combines them.

---

# So, where do we start?

---

# So, where do we start?

```
FallibleAsynchronousContext<A>
```

A fallible, asynchronous context containing a value (**A**)

---

# Context

```
Context<A>
```

A context containing a value (**A**)

---

# Context

Things we should expect to do with a context:

1. Create one
2. Change one

---

# Context

## Create

```
export class Context<A> {
  constructor(private readonly value: A) {}
}
```

---

# Context

## Change

```
export class Context<A> {
  constructor(private readonly value: A) {}

  public changeValue<B>(changer: (value: A) => B): Context<B> {
    const newContent = changer(this.value);
    return new Context(newContent);
  }
}
```

---

# Context

## Change

```
const a = new Context(5);
const b = new Context("Less than or equal to 5");
const c = new Context("Greater than 5");

const d = a.changeValue(num => {
  if (num <= 5) {
    return b;
  } else {
    return c;
  }
});

// >>> .type d
// const d: Context<Context<string>>
```

---

# Context

## Change

```
const a = new Context(5);
const b = new Context("Less than or equal to 5");
const c = new Context("Greater than 5");

a.changeContextAndValue(num => {
  if (num <= 5) {
    return b;
  } else {
    return c;
  }
});

// >>> .type d
// const d: Context<string>
```

---

# Context

## Change

```
export class Context<A> {
  constructor(private readonly value: A) {}

  public changeValue<B>(changer: (value: A) => B): Context<B> {
    const newContent = changer(this.value);
    return new Context(newContent);
  }

  public changeContextAndValue<B>(
    changer: (value: A) => Context<B>
  ): Context<B> {
    return changer(this.value);
  }
}
```

---

# AsynchronousContext

```
AsynchronousContext<A>
```

An asynchronous context containing a value (**A**)

---

# AsynchronousContext

## Create

```
export class AsynchronousContext<R, A> {
  constructor(private readonly operation: (resolve: (value: A) => R) => R) {}
}
```

---

# AsynchronousContext

## Change

```
export class AsynchronousContext<R, A> {
  // ...

  public changeValue<B>(changer: (value: A) => B): AsynchronousContext<R, B> {
    return new AsynchronousContext(resolve => {
      return this.operation((value: A) => {
        const newValue = changer(value);
        return resolve(newValue);
      });
    });
  }
}
```

---

# AsynchronousContext

## Change

```
export class AsynchronousContext<R, A> {

  // ...

  public changeContextAndValue<B>(
    changer: (value: A) => AsynchronousContext<R, B>
  ): AsynchronousContext<R, B> {
    return new AsynchronousContext(resolve => {
      return this.operation((value: A) => {
        const newContext = changer(value);
        return ???;
      });
    });
  }
}
```

---

# AsynchronousContext

## Use

```
export class AsynchronousContext<R, A> {
  // ...

  public execute(resolve: (value: A) => R): R {
    return this.operation(value => {
      return resolve(value);
    });
  }
}
```

---

# AsynchronousContext

## Change

```
export class AsynchronousContext<R, A> {

  // ...

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
```

---

# FallibleAsynchronousContext

```
FallibleAsynchronousContext<A>
```

A fallible, asynchronous context containing a value (**A**)

---

# FallibleAsynchronousContext

## Create

```
export class FallibleAsynchronousContext<R, A> {
  constructor(
    private readonly operation: (
      resolve: (value: A) => R,
      reject: (error: Error) => R
    ) => R
  ) {}
}
```

---

# FallibleAsynchronousContext

## Use

```
export class FallibleAsynchronousContext<R, A> {

  // ...

  public execute(resolve: (value: A) => R, reject: (error: Error) => R): R {
    return this.operation(
      value => {
        return resolve(value);
      },
      error => {
        return reject(error);
      }
    );
  }
}
```

---

# FallibleAsynchronousContext

## Change

```
export class FallibleAsynchronousContext<R, A> {

  // ...

  public changeValue<B>(
    changer: (value: A) => B
  ): FallibleAsynchronousContext<R, B> {
    return new FallibleAsynchronousContext((resolve, reject) => {
      return this.operation(
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
}
```

---

# FallibleAsynchronousContext

## Change

```
export class FallibleAsynchronousContext<R, A> {

  // ...

  public changeContextAndValue<B>(
    changer: (value: A) => FallibleAsynchronousContext<R, B>
  ): FallibleAsynchronousContext<R, B> {
    return new FallibleAsynchronousContext((resolve, reject) => {
      return this.operation(
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
```
