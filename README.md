# Course App

A course application with a TypeScript web client and a Python/FastAPI server. The project description also mentions machine-learning capabilities; document specific recommendation or analytics features here only when they are implemented and verified in the code.

## Project layout

```text
.
├── fastapi-client/   # Next.js / TypeScript client
└── server/           # Python API
```

## Technology

- **Client:** TypeScript and Next.js
- **Backend:** Python and FastAPI
- **Machine learning:** [Document implemented models and workflows here, if applicable]

## Getting started

### Prerequisites

- Node.js and npm (use the version supported by `fastapi-client/package.json`)
- Python (use the version supported by the backend dependencies)

### Client

```bash
cd fastapi-client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser. Refer to the client package scripts for additional commands.

### Backend

See the `server/` directory for dependency and application configuration. Create a local virtual environment, install the project's declared dependencies, and use the documented ASGI entry point to run FastAPI. Add the exact startup command and required environment variables here once verified.

## Configuration and secrets

Document required environment variables in a committed `.env.example` file. Keep actual `.env` files, credentials, API tokens, and production secrets out of version control.

## API documentation

When the API is running, FastAPI's interactive documentation is typically available at `/docs`; confirm the configured host and port for this project.

## Testing

Use the test and lint scripts declared by the client and backend. Add the verified commands here as the project test suite is established.

## Contributing

Please open an issue to discuss substantial changes. Pull requests should explain the change and include relevant tests or validation steps.

## License

No license was verified for this repository. Add a `LICENSE` file before granting reuse or redistribution rights.
