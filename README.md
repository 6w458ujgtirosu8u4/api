# Worker + D1 Database

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/d1-template)

![Worker + D1 Template Preview](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/cb7cb0a9-6102-4822-633c-b76b7bb25900/public)

<!-- dash-content-start -->

D1 is Cloudflare's native serverless SQL database ([docs](https://developers.cloudflare.com/d1/)). This project demonstrates using a Worker with a D1 binding to execute a SQL statement. A simple frontend displays the result of this query:

```SQL
SELECT * FROM comments LIMIT 3;
```

The D1 database is initialized with a `comments` table and this data:

```SQL
INSERT INTO comments (author, content)
VALUES
    ('Kristian', 'Congrats!'),
    ('Serena', 'Great job!'),
    ('Max', 'Keep up the good work!')
;
```

> [!IMPORTANT]
> When using C3 to create this project, select "no" when it asks if you want to deploy. You need to follow this project's [setup steps](https://github.com/cloudflare/templates/tree/main/d1-template#setup-steps) before deploying.

<!-- dash-content-end -->

## Getting Started

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```
npm create cloudflare@latest -- --template=cloudflare/templates/d1-template
```

A live public deployment of this template is available at [https://d1-template.templates.workers.dev](https://d1-template.templates.workers.dev)

## Setup Steps

1. Install the project dependencies with a package manager of your choice:
   ```bash
   npm install
   ```
2. Create a [D1 database](https://developers.cloudflare.com/d1/get-started/) with the name "d1-template-database":
   ```bash
   npx wrangler d1 create d1-template-database
   ```
   ...and update the `database_id` field in `wrangler.json` with the new database ID.
3. Run the following db migration to initialize the database (notice the `migrations` directory in this project):
   ```bash
   npx wrangler d1 migrations apply --remote d1-template-database
   ```
4. Deploy the project!
   ```bash
   npx wrangler deploy
   ```

# Node.js HTTP Server Template for Cloudflare Workers

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/nodejs-http-server-template)

<!-- dash-content-start -->

A simple Node.js HTTP server template using the built-in `node:http` module, designed to run on Cloudflare Workers.

<!-- dash-content-end -->

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run locally:**

   ```bash
   npm run dev
   ```

3. **Deploy to Cloudflare Workers:**
   ```bash
   npx wrangler deploy
   ```

## Usage

The template creates a basic HTTP server:

```javascript
import { createServer } from "node:http";
import { httpServerHandler } from "cloudflare:node";

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Node.js HTTP server!");
});

server.listen(8080);
export default httpServerHandler({ port: 8080 });
```

## Configuration

The `wrangler.toml` includes the necessary compatibility flags:

```toml
compatibility_flags = ["nodejs_compat"]
compatibility_date = "2025-09-03"
```

## Scripts

- `npm start` - Start the server
- `npm run dev` - Start with hot reload
- `npm test` - Run tests

## Learn More

- [Cloudflare Workers Node.js HTTP Documentation](https://developers.cloudflare.com/workers/runtime-apis/nodejs/http/)
- [Node.js HTTP Module](https://nodejs.org/api/http.html)

## License

MIT

```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```
