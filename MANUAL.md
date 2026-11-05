# Operations manual

## Purpose

This service answers `GET /api/ip` with the requesting client's detected IP in JSON and saves the IP plus the request time in SQLite. It does not collect a body, user-agent, or other identifying request metadata.

## Requirements

- Node.js 20+
- npm

## Install

From the repository directory:

```bash
npm install
```

Optional settings can be supplied as environment variables. `.env.example` documents the variables; Node does not automatically load `.env`, so export values in your shell or use your deployment platform's environment configuration.

```bash
export PORT=3000
export DB_PATH=./data/ips.sqlite
export TRUST_PROXY=false
```

## Start and verify

```bash
npm start
```

In another terminal:

```bash
curl -s http://localhost:3000/api/ip
```

Example response:

```json
{"ip":"::1"}
```

The actual address depends on the client and network. Each successful API request writes one row to the database. The database and its parent directory are created automatically.

## API reference

- Method: `GET`
- Path: `/api/ip`
- Success: HTTP `200`, JSON object containing the `ip` string only, e.g. `{"ip":"203.0.113.10"}`
- Failure: HTTP `500` with a generic JSON error if persistence fails.

## SQLite data

Default file: `data/ips.sqlite` (override with `DB_PATH`). The table is:

| Column | Type | Meaning |
| --- | --- | --- |
| `id` | INTEGER | Auto-incrementing row identifier |
| `ip` | TEXT | Detected client IP |
| `requested_at` | TEXT | UTC ISO-8601 timestamp |

For a local inspection, if the `sqlite3` command-line tool is installed:

```bash
sqlite3 data/ips.sqlite 'SELECT id, ip, requested_at FROM ip_requests ORDER BY id DESC LIMIT 20;'
```

The application does not provide an endpoint to read stored records.

## Reverse proxy deployments

By default, Express does not trust proxy headers, which avoids accepting a client-supplied `X-Forwarded-For` value as the address. If you deploy behind a reverse proxy, configure `TRUST_PROXY` to match only the trusted proxy topology (for example, `loopback` for a local proxy). Ensure the proxy overwrites/sets forwarding headers correctly. Never set proxy trust broadly without understanding the network, since that can let clients spoof the recorded IP.

Use HTTPS for public deployments and restrict filesystem access to the SQLite file.

## Privacy and maintenance

IP addresses may be personal data. Inform users, collect only what is needed, control database access, and define an appropriate retention period. Back up or delete the SQLite file according to your operational policy. The database may create `-wal` and `-shm` sidecar files while running; keep them together during backup.

## Troubleshooting

- **Port already in use:** set `PORT` to an available port.
- **Cannot create/open database:** make sure the process can write to the directory containing `DB_PATH`.
- **Native module install errors:** use a supported Node.js version and consult `better-sqlite3` installation requirements for your platform.
- **Wrong IP behind proxy:** review `TRUST_PROXY` and the proxy's forwarding-header configuration; do not trust unverified headers.
