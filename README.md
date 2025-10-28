# Marketing API

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/)

![Node.js](https://img.shields.io/badge/node-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/cloudflare%20workers-f38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Python](https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/fastapi-009688?style=for-the-badge&logo=fastapi&logoColor=white)

## Description

Marketing API is a unified backend solution for managing and automating marketing campaigns, analytics, and integrations.
It leverages Cloudflare Workers for scalable serverless deployment and supports both Node.js/TypeScript and Python/FastAPI stacks.
The API provides endpoints for campaign management, reporting, and third-party integrations, designed for high performance and reliability.

## Getting Started

A live public deployment of this project is available at [https://marketing-api.botprzemek.pl/](https://marketing-api.botprzemek.pl/)

### Setup Steps

1. **Clone the repository**

   ```sh
   git clone https://github.com/botprzemek/marketing-api.git
   cd marketing-api
   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Configure environment variables**

   - Copy `.env.example` to `.env` and adjust values as needed.

4. **Run development server**

   ```sh
   npm run dev
   ```

5. **Deploy to Cloudflare Workers**
   ```sh
   npm run deploy
   ```

### Scripts

- `npm start` - Start the server
- `npm run dev` - Start with hot reload
- `npm test` - Run tests

## Learn More

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.
