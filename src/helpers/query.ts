export const sort =
  <Fields>(fields: Array<keyof Fields>) =>
  (sort?: string) =>
    fields.find((field) => field === sort) || fields.at(0)!;

export const order = (order?: string) => (order?.toLocaleUpperCase() === "DESC" ? "DESC" : "ASC");

export const limit = (size?: string) => Number(size || 99999999);

export const offset = (page?: string, size?: string) => (Number(page || 1) - 1) * limit(size);

export const filter =
  <Fields>(fields: Array<keyof Fields>) =>
  (input: Array<unknown> = fields) =>
    fields.filter((field) => input.includes(field)).join(", ");

export default {
  sort,
  order,
  limit,
  offset,
  filter,
};
