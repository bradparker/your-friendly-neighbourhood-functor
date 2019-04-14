import { authorize, decode, update, validate } from "./articles";
import { decodeToken } from "./authentication";

interface Request {
  headers: {
    Authorization: string;
  };
  urlParams: { slug: string };
  body: string;
}

interface Response {
  status: number;
  body: string;
}

const respondSuccess = payload => ({
  status: 200,
  body: JSON.stringify(payload)
});

const respondFailure = error => ({
  status: 500,
  body: JSON.stringify({ message: error.message })
});

export const handler = ({
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
