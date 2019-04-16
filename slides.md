```
    ____                       _
   / __ \_________  ____ ___  (_)_______  _____
  / /_/ / ___/ __ \/ __ `__ \/ / ___/ _ \/ ___/
 / ____/ /  / /_/ / / / / / / (__  )  __(__  )
/_/   /_/   \____/_/ /_/ /_/_/____/\___/____/

Your friendly neighbourhood Functor
```

---

# The problem

. . .

We're going to implement a HTTP API handler which attempts to update an
article identified by a slug in the URL.

. . .

It will:

. . .

* Attempt to decode the Authorization header into some claims

. . .

* Authorize if those claims are sufficient to update the article

. . .

* Attempt to validate the request params

. . .

* Attempt to update the article with valid params

. . .

* Respond with the updated article _or_ respond with a failure

. . .

No sweat!

---

# The problem

We're going to be given these functions

```typescript
const getAuth:   (request: Request) => string
const getSlug:   (request: Request) => string
const getParams: (request: Request) => UpdateArticleParams

const decodeToken: (authorization: string)
  => Promise<Claims>

const loadAndAuthorize: (slug: string, claims: Claims)
  => Promise<Article>

const validate: (params: UpdateArticleParams, article: Article)
  => Promise<ValidUpdateArticleParams>

const update: (article: Article, params: ValidUpdateArticleParams)
  => Promise<Article>

const respondSuccess: (article: Article)
  => Response

const respondFailure: (error: Error)
  => Response
```

. . .

Our job is just to put them together to produce a function

```
const handler: (request: Request) => Promise<Response>
```

---

# How're we going to do that?

. . .

Let's start by just trying to get to loadAndAuthorize

. . .

We have these relevant bits

```typescript
const getAuth:   (request: Request) => string

const decodeToken: (authorization: string)
  => Promise<Claims>

const loadAndAuthorize: (slug: string, claims: Claims)
  => Promise<Article>
```

---

# How're we going to do that?

We can produce a function that goes from the request to Claims pretty easy

```typescript
const getAuthAndDecodeToken = (request: Request): Promise<Claims> =>
  decodeToken(getAuth(request));
```

. . .

We can also make one that goes from Request and Claims to Article.

```
const getSlugLoadAndAuthorize = (request: Request) => (
  claims: Claims
): Promise<Article> => loadAndAuthorize(getSlug(request));
```

. . .

Psst (Don't sweat the currying)

. . .

```
const getSlugLoadAndAuthorizePartiallyApplied: (claims: Claims)
  => Promise<Article>
```

---

# How're we going to do that?

But how do we get from `Promise<Claims>` to `Promise<Article>`?

. . .

How do we get at the Claims getSlugLoadAndAuthorize needs?

---

# How're we going to do that?

Let's take a step back.

. . .

Let's try to understand promises.

. . .

Let's try to invent them :)

---

# What are Promises?

---

# What are Promises?

A Promise is an object that is used as a placeholder for the eventual
results of a deferred (and possibly asynchronous) computation.

From the ECMA 262 Section on Promises
https://tc39.github.io/ecma262/#sec-promise-objects

---

# What are Promises?

A Promise is a placeholder for the eventual result of an asynchronous
operation.

---

# What are Promises?

A Promise is a placeholder for the eventual _result_ of an asynchronous
operation.

---

# What are Promises?

A Promise is a placeholder for the eventual _value_ of an asynchronous
operation.

---

# What are Promises?

A Promise is a placeholder for the eventual _value_ of an asynchronous
operation _which can fail_.

---

# What are Promises?

A value in a fallible, asynchronous context.

---

# What are Promises?

A fallible, asynchronous context containing a value.

. . .

Let's invent them step by step.

---

# What steps?

. . .

How about ...?

. . .

1 - A context containing a value

. . .

2 - An asynchronous context containing a value

. . .

3 - A fallible, asynchronous context containing a value

---

# Context

. . .

A context containing a value

. . .

```
class Context<A> { }
```


---

# Context

What might we want to do with a `Context<A>`?

. . .

1 - Create / use one

. . .

2 - Change one

---

# Context

## Create / use

. . .

```
export class Context<A> {
  constructor(public readonly value: A) {}
}
```

---

# Context

## Change

Code time.

. . .

```
export class Context<A> {
  constructor(public readonly value: A) {}

  public changeValue<B>(change: (value: A) => B): Context<B> {
    return new Context(change(this.value));
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

const d = a.changeValue(num => {
  if (num <= 5) {
    return b.value;
  } else {
    return c.value;
  }
});

// >>> .type d
// const d: Context<string>
```

. . .

We _could_ do this... but we could maybe do a little better.

---


# Context

## Change

```
const a = new Context(5);
const b = new Context("Less than or equal to 5");
const c = new Context("Greater than 5");

const d = a.changeContextAndValue(num => {
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

Code time.

. . .

```
export class Context<A> {
  constructor(public readonly value: A) {}

  public changeValue<B>(change: (value: A) => B): Context<B> {
    return new Context(change(this.value));
  }

  public changeContextAndValue<B>(
    change: (value: A) => Context<B>
  ): Context<B> {
    return change(this.value);
  }
}
```

. . .

... hey, presto?!

---

# Asynchronous context

. . .

An asynchronous context containing a value

. . .

```
class AsynchronousContext<A> { }
```

---

# Asynchronous context

What if we tried to do the same things that we did with a Context, with an
AsynchronousContext?

---

# Asynchronous context

## Create / use

Code time.

. . .

```
export class AsynchronousContext<R, A> {
  constructor(
    public readonly execute: (resolve: (value: A) => R) => R
  ) {}
}
```

---

# Asynchronous context

## Change

Code time.

. . .

```
export class AsynchronousContext<R, A> {
  constructor(
    public readonly execute: (resolve: (value: A) => R) => R
  ) {}

  public changeValue<B>(
    change: (value: A) => B
  ): AsynchronousContext<R, B> {
    return new AsynchronousContext(resolve => {
      return this.operation((value: A) => {
        return resolve(change(value));
      });
    });
  }
}
```

---

# Asynchronous context

## Change

Code time.

. . .

```
export class AsynchronousContext<R, A> {
  constructor(public readonly execute: (resolve: (value: A) => R) => R) {}

  public changeValue<B>(
    change: (value: A) => B
  ): AsynchronousContext<R, B> {
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
```

. . .

That's a little more interesting!

---

# Fallible, asynchronous context

. . .

An asynchronous context containing a value

. . .

```
class AsynchronousContext<A> { }
```

---

# Fallible, asynchronous context

## Create / use

Code, code, code.

. . .


```
export class FallibleAsynchronousContext<R, A> {
  constructor(
    private readonly execute: (
      resolve: (value: A) => R,
      reject: (error: Error) => R
    ) => R
  ) {}
}
```

---

# Fallible, asynchronous context

## Change


MOAR CODE!

. . .

```
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
}
```

---

# Fallible, asynchronous context

## Change

Code, nearly there.

. . .

```
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
```

---

# Fallible, asynchronous context

## Change (from failure to success :))

Code!!!

. . .

```
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

  public changeErrorToValue<B>(
    change: (error: Error) => B
  ): FallibleAsynchronousContext<R, B> {
    return new FallibleAsynchronousContext((resolve, reject) => {
      return this.execute(
        resolve,
        (error: Error) => {
          return resolve(change(error));
        }
      );
    });
  }
}
```

. . .

That is _much_ more interesting!

---

# Let's take stock

. . .

We had two functions.

. . .

That are both async and can fail.

. . .

One needs to pass it's value to next.

. . .

These!

```typescript
const getAuthAndDecodeToken = (request: Request)
  => Promise<Claims>

const getSlugLoadAndAuthorize = (request: Request) => (claims: Claims)
  => Promise<Article>
```

---

# Let's take stock

We had two functions.

That are both async and can fail.

One needs to pass it's value to next.

These?

```typescript
const getAuthAndDecodeToken = (request: Request)
  => Promise<Claims>

const getSlugLoadAndAuthorizePartiallyApplied = (claims: Claims)
  => Promise<Article>
```

---

# Let's take stock

We had two functions.

That are both async and can fail.

One needs to pass it's value to next.

These??

```typescript
const getAuthAndDecodeToken = (request: Request)
  => FallibleAsynchronousContext<void, Claims>

const getSlugLoadAndAuthorizePartiallyApplied = (claims: Claims)
  => FallibleAsynchronousContext<void, Article>
```

---

# Let's take stock

We had two functions.

That are both async and can fail.

One needs to pass it's value to next.

These??!!

```typescript
const getAuthAndDecodeToken = (request: Request)
  => Context<Claims>

const getSlugLoadAndAuthorizePartiallyApplied = (claims: Claims)
  => Context<Article>
```

---

# We have two functions and we want one

. . .

So we have:

```typescript
const getAuthAndDecodeToken = (request: Request)
  => Context<Claims>

const getSlugLoadAndAuthorizePartiallyApplied = (claims: Claims)
  => Context<Article>
```

. . .

and we want:

```typescript
const getAuthAndDecodeTokenAndGetSlugLoadAndAuthorize: (request: Request)
  => Context<Article>
```

---

# Drumroll ...

. . .


```typescript
const getAuthAndDecodeTokenAndGetSlugLoadAndAuthorize = (
  request: Request
): Context<Article> => {
  return getAuthAndDecodeToken(request).changeContextAndValue(
    getSlugLoadAndAuthorize(request)
  );
};
```

---

# But, for real

```typescript
const handlerSoFar = (
  request: Request
): Context<Article> => {
  const auth = getAuth(request);
  const slug = getSlug(request);

  return decodeToken(auth).changeContextAndValue(
    loadAndAuthorize(slug)
  );
};
```

---

# But, for real

```typescript
const handlerSoFar = (
  request: Request
): FallibleAsynchronousContext<void, Article> => {
  const auth = getAuth(request);
  const slug = getSlug(request);

  return decodeToken(auth).changeContextAndValue(
    loadAndAuthorize(slug)
  );
};
```

---

# But, for real

```typescript
const handlerSoFar = (
  request: Request
): FallibleAsynchronousContext<void, UpdateArticleParams> => {
  const auth = getAuth(request);
  const slug = getSlug(request);
  const params = getParams(request);

  return decodeToken(auth)
    .changeContextAndValue(loadAndAuthorize(slug))
    .changeContextAndValue(validate(params));
};
```

---

# But, for real

```typescript
const handlerSoFar = (
  request: Request
): FallibleAsynchronousContext<void, Article> => {
  const auth = getAuth(request);
  const slug = getSlug(request);
  const params = getParams(request);

  return decodeToken(auth)
    .changeContextAndValue(loadAndAuthorize(slug))
    .changeContextAndValue(article => {
      return validate(params, article).changeContextAndValue(
        validParams => {
          return update(validParams, article);
        }
      );
    });
};
```

---

# But, for real

```typescript
const handlerSoFar = (
  request: Request
): FallibleAsynchronousContext<void, Response> => {
  const auth = getAuth(request);
  const slug = getSlug(request);
  const params = getParams(request);

  return decodeToken(auth)
    .changeContextAndValue(loadAndAuthorize(slug))
    .changeContextAndValue(article => {
      return validate(params, article).changeContextAndValue(
        validParams => {
          return update(validParams, article);
        }
      );
    })
    .changeValue(respondSuccess);
};
```

---

# But, for real

```typescript
const handlerSoFar = (
  request: Request
): FallibleAsynchronousContext<void, Response> => {
  const auth = getAuth(request);
  const slug = getSlug(request);
  const params = getParams(request);

  return decodeToken(auth)
    .changeContextAndValue(loadAndAuthorize(slug))
    .changeContextAndValue(article => {
      return validate(params, article).changeContextAndValue(
        validParams => {
          return update(validParams, article);
        }
      );
    })
    .changeValue(respondSuccess)
    .changeErrorToValue(respondFailure);
};
```

---

# But, for real

```typescript
const handler = (
  request: Request
): Promise<Article> => {
  const auth = getAuth(request);
  const slug = getSlug(request);
  const params = getParams(request);

  return decodeToken(auth)
    .then(loadAndAuthorize(slug))
    .then(article => {
      return validate(params, article).then(
        validParams => {
          return update(validParams, article);
        }
      );
    })
    .then(respondSuccess)
    .catch(respondFailure);
};
```

---

# But, for real

```typescript
const handler = async (
  request: Request
): Promise<Article> => {
  const auth = getAuth(request);
  const slug = getSlug(request);
  const params = getParams(request);

  try {
    const token = await decodeToken(auth);
    const article = await loadAndAuthorize(slug, token);
    const validParams = await validate(params, article);
    const updatedArticle = await update(validParams, article);

    return respondSuccess(updatedArticle)
  } catch (error) {
    return respondFailure(error);
  }
};
```

---

# Wrapping up

. . .

What is, a Promise? What does using them give us?

. . .


THE ABILITY TO COMPOSE COMPLEX THINGS!!!
