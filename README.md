# ncr-console

Browser console for **Nonconformance Report (NCR)** create / list / status transitions.

Repository: [Erwinya/ncr-console](https://github.com/Erwinya/ncr-console)

Companion API: [qms-ncr-service](https://github.com/Erwinya/qms-ncr-service)

## Features

- Create NCRs (title, description, severity, lot/part, reporter)
- List and filter by status
- Apply workflow transitions (`OPEN` → `UNDER_REVIEW` → `CONTAINED` → `CLOSED`)
- Requires `containmentAction` when moving to `CONTAINED`
- Vite proxy to `http://localhost:8082` for local use

## Requirements

- Node.js 20+
- Running [qms-ncr-service](https://github.com/Erwinya/qms-ncr-service) on port `8082`

## Setup

```bash
npm install
cp .env.example .env
```

Windows PowerShell:

```powershell
npm install
Copy-Item .env.example .env
```

## Run

Terminal 1 — API:

```bash
# in qms-ncr-service
./mvnw spring-boot:run
```

```powershell
# in qms-ncr-service
.\mvnw.cmd spring-boot:run
```

Terminal 2 — console:

```bash
npm run dev
```

```powershell
npm run dev
```

Open http://localhost:5174

## Build

```bash
npm run build
npm run preview
```

```powershell
npm run build
npm run preview
```

## Tests

```bash
npm test
```

```powershell
npm test
```

## License

MIT
