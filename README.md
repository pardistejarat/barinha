# Barinha IP lookup

A small Node.js service that returns the caller's IP address as JSON and records that IP with a UTC timestamp in a local SQLite database.

## Requirements

- Node.js 20 or newer
- npm

## Install and run

```bash
npm install
npm start
```

The server listens on `http://localhost:3000` by default. To choose another port:

```bash
PORT=8080 npm start
```

## API

`GET /api/ip` responds with only the detected IP address:

```json
{"ip":"203.0.113.10"}
```

Each successful request is saved to SQLite in `data/ips.sqlite` with a UTC timestamp. The database is created automatically. No user-agent, forwarded-header, or other request data is stored by this application.

## Configuration

Copy `.env.example` values into your environment as needed. `PORT` sets the HTTP port and `DB_PATH` sets the SQLite file path. `TRUST_PROXY` defaults to `false`; leave it that way unless the service is behind a proxy you control. If needed, set it to a narrowly scoped Express trust-proxy value (for example, `loopback`) so the app can use the proxy-provided client IP. Do not blindly trust arbitrary forwarded headers.

## Manual

See [MANUAL.md](MANUAL.md) for setup, API, database, deployment, and troubleshooting instructions.

## Privacy and security

IP addresses can be personal data. Tell users what is collected, limit access to the database, and set a retention/deletion policy appropriate to your use. Use HTTPS when exposing the service publicly. This project intentionally stores only the IP and timestamp.
