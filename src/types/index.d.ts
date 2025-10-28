interface QueryOptions {
  sort?: string;
  order?: string;
  size?: string;
  page?: string;
  filter?: string[];
}

interface Bindings {
  D1: D1Database;
}
