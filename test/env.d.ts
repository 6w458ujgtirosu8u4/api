declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {
    MIGRATIONS: D1Migration[];

    D1: D1Database;
  }
}
