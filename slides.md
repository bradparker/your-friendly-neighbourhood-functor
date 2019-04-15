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
const decodeToken: (authorization: string)        => Promise<Claims>

const authorize: (slug: string, claims: Claims)   => Promise<void>

const validate: (params: RequestParams)           => Promise<ValidParams>

const update: (slug: string, params: ValidParams) => Promise<Article>

const respondSuccess: (article: Article)          => Response

const respondFailure: (error: Error)              => Response
```

Our job is just to put them together :)

---

# How're we going to do that?

. . .

Let's look at those first two functions.

. . .


```typescript
const decodeToken: (authorization: string)        => Promise<Claims>

const authorize: (slug: string, claims: Claims)   => Promise<void>
```

---

# How're we going to do that?

Let's look at those first two functions.

```typescript
const decodeToken: (authorization: string)        => Promise<Claims>
                                                             ~~~~~~
const authorize: (slug: string, claims: Claims)   => Promise<void>
                                        ~~~~~~
```

. . .

We need to somehow get the Claims which is in the Promise returned by
decodeToken into authorize

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

1 - Create one

. . .

2 - Change one

---

# Context

## Create

. . .

```
export class Context<A> {
  constructor(public readonly value: A) {}
}
```

---

# Context

## Change

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

## Create

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

## Create

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
const decodeToken: (authorization: string)
  => Promise<Claims>

const authorize: (slug: string, claims: Claims)
  => Promise<void>
```

---

# Let's take stock

We had two functions.

That are both async and can fail.

One needs to pass it's value to next.

These?

```typescript
const decodeToken: (authorization: string)
  => FallibleAsynchronousContext<void, Claims>

const authorize: (slug: string, claims: Claims)
  => FallibleAsynchronousContext<void, void>
```

---

# Let's take stock

We had two functions.

That are both async and can fail.

One needs to pass it's value to next.

These!?

```typescript
const decodeToken: (authorization: string)
  => Context<Claims>

const authorize: (slug: string, claims: Claims)
  => Context<void>
```

---

# Let's take stock

We had two functions.

That are both async and can fail.

One needs to pass it's value to next.

These!?

```typescript
const decodeToken: (authorization: string)
  => Context<Claims>

const authorize: (claims: Claims)
  => Context<void>
```

---

# We have two functions and we want one

. . .

So we have:

```typescript
const decodeToken: (authorization: string) => Context<Claims>

const authorize: (claims: Claims) => Context<void>
```

. . .

and we want:

```typescript
const decodeAndAuthorize: (authorization: string) => Context<void>
```

---

# Drumroll ...

. . .


```typescript
const decodeAndAuthorize = (authorization: string): Context<void> => {
  return decode(authorization).changeContextAndValue(authorize);
};
```
