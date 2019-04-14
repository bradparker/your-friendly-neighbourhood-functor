export const authorize = (slug, userId) => Promise.resolve();

export const decode = input => JSON.parse(input);

export const update = (slug, attribtues) =>
  Promise.resolve({
    id: "def-456",
    slug,
    ...attribtues
  });

export const validate = (slug, attributes) =>
  Promise.resolve({ ...attributes });
