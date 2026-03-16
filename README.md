# PCCC Verification Automation Monorepo

## 1. Project Title
PCCC Verification Automation Monorepo

## 2. Overview
This repository is a Node.js/TypeScript monorepo that automates key steps of the Korean Personal Customs Clearance Code (PCCC, 개인통관고유부호) verification journey used by cross-border e-commerce services. It exposes a NestJS HTTP API and internally drives a requester pipeline that calls the Korea Customs UNI-PASS endpoints in the same sequence a browser client would.

The system is organized into reusable packages: an HTTP client wrapper with cookie-jar support, a UNI-PASS domain package that encapsulates verification requesters, and a server package that exposes these capabilities through API endpoints.

## 3. Problem
Cross-border commerce systems often need to verify user identity through Korea Customs flows, but the official process is designed for interactive browser use (session cookies, CAPTCHA checks, and SMS steps). Integrating this manually into backend systems is brittle and operationally expensive.

This project addresses that by codifying the verification sequence into deterministic requester modules and exposing API endpoints that backend services can call programmatically.

## 4. System Architecture
The repository follows a package-oriented monorepo design:

- API layer: NestJS controller in the server package.
- Service layer: thin service wrapper around the UNI-PASS domain class.
- Automation layer: step-specific requester modules for each remote UNI-PASS action.
- Transport layer: shared HTTP client abstraction built on Axios with optional cookie-jar support.

ASCII architecture view:

```text
Client
	 |
	 v
API Server (NestJS)
	 |
	 v
Verification Service
	 |
	 v
Requester Pipeline
	 |
	 v
Korea Customs Website (UNI-PASS)
```

## 5. Monorepo Structure
```text
pccc-main/
	packages/
		http/
		server/
		unipass.customs/
```

- `packages/http/`
	- Shared HTTP utilities.
	- `Http` class wraps Axios and normalizes responses.
	- Supports text/buffer responses and optional `tough-cookie` `CookieJar` handling.

- `packages/server/`
	- NestJS API entrypoint (`main.ts`, `app.module.ts`).
	- `customs.controller.ts` exposes verification endpoints.
	- `개인고유통관부호.service.ts` delegates to domain logic in `unipass.customs`.

- `packages/unipass.customs/`
	- Domain package for personal customs verification flow.
	- `개인고유통관부호` class orchestrates per-step requesters.
	- `requesters/*` contains reverse-engineered step handlers:
		- `1_init`
		- `2_captcha-img`
		- `3_validate-captcha`
		- `4_sms-send`
		- `5_validate-sms`
	- Includes `e2e.spec.ts` that demonstrates an interactive flow with shared cookies.

## 6. Verification Workflow
The automation pipeline reproduces the browser interaction sequence against UNI-PASS endpoints.

Implemented sequence in code:

1. Initialize verification session
2. Request CAPTCHA image
3. Validate CAPTCHA answer
4. Send SMS verification request
5. Validate SMS code

Notes based on current implementation:

- The domain class (`개인고유통관부호`) orchestrates the sequence via dedicated requester classes.
- Requesters send browser-like headers and parse response contracts (`"S"`/`"F"` and JSON result objects).
- API endpoints currently instantiate a new HTTP client per call, so cross-request session continuity is not persisted by the server layer.
- Retrieval/parsing of the final PCCC value itself is not currently implemented as a dedicated step in this repository.

## 7. API Endpoints
Base URL: `http://localhost:3000`

All endpoints are under `/customs` and are implemented as `POST`.

### `POST /customs/initialize`
Initializes UNI-PASS session page access.

Request body:
```json
{}
```

Response example:
```json
null
```

### `POST /customs/captcha-img`
Requests CAPTCHA image bytes.

Request body:
```json
{}
```

Response example:
```json
{
	"type": "Buffer",
	"data": [137, 80, 78, 71]
}
```

### `POST /customs/validate-captcha`
Validates CAPTCHA input.

Request body:
```json
{
	"인증번호": "123456"
}
```

Response example:
```json
{
	"valid": true
}
```

### `POST /customs/send-sms`
Requests SMS verification send.

Request body:
```json
{
	"전화번호": "01012345678",
	"이름": "홍길동",
	"주민번호": "0101011234567",
	"인증번호": "123456"
}
```

Response example:
```json
{
	"valid": true
}
```

### `POST /customs/verify-sms`
Validates SMS code.

Request body:
```json
{
	"전화번호": "01012345678",
	"이름": "홍길동",
	"주민번호": "0101011234567",
	"인증번호": "654321"
}
```

Response example:
```json
{
	"verified": true
}
```

## 8. Key Technical Features
- Reverse-engineered verification workflow targeting UNI-PASS web endpoints.
- Modular requester pipeline with one class per verification step.
- Typed HTTP abstraction supporting text/buffer responses and header normalization.
- Cookie-jar capability (`tough-cookie`) available in transport layer and used in e2e flow.
- API-driven verification service built with NestJS controller/service separation.

Current state clarifications:

- Redis-backed session storage is not implemented in this repository.
- Server endpoints do not yet persist a shared session lifecycle across multiple API calls.

## 9. Tech Stack
- Node.js (Volta-pinned: 22.15.1)
- TypeScript
- NestJS
- Axios
- tough-cookie
- Ramda
- Vitest
- pnpm workspace monorepo

## 10. Running the Project
### Prerequisites
- Node.js `22.x` (repository pins `22.15.1` via Volta)
- pnpm `10.x` (repository pins `10.11.0` via Volta)

### Install dependencies
```bash
cd pccc-main
corepack enable
pnpm install
```

### Environment variables
No environment variables are required by the current code.

### Start server
There is no dedicated `server` package script yet. Run NestJS entrypoint through `ts-node`:

```bash
cd pccc-main
pnpm ts-node -P packages/http/tsconfig.json packages/server/main.ts
```

Server listens on:

```text
http://localhost:3000
```

### Development mode
No watch-mode script is currently defined in `package.json`. Use the same start command during development.

### Run tests
```bash
cd pccc-main
pnpm --filter @workspace/http test
pnpm --filter @workspace/unipass.customs test
```

## 11. Example Usage
Example client flow using `curl`:

```bash
# 1) Initialize
curl -X POST http://localhost:3000/customs/initialize \
	-H "Content-Type: application/json" \
	-d "{}"

# 2) Validate captcha
curl -X POST http://localhost:3000/customs/validate-captcha \
	-H "Content-Type: application/json" \
	-d '{"인증번호":"123456"}'

# 3) Send SMS
curl -X POST http://localhost:3000/customs/send-sms \
	-H "Content-Type: application/json" \
	-d '{"전화번호":"01012345678","이름":"홍길동","주민번호":"0101011234567","인증번호":"123456"}'

# 4) Verify SMS
curl -X POST http://localhost:3000/customs/verify-sms \
	-H "Content-Type: application/json" \
	-d '{"전화번호":"01012345678","이름":"홍길동","주민번호":"0101011234567","인증번호":"654321"}'
```

## 12. Future Improvements
- Add session persistence across API calls (for example, Redis-backed workflow sessions).
- Add retry/timeout/backoff strategy for external UNI-PASS calls.
- Add structured observability (request tracing, metrics, error taxonomy).
- Introduce rate limiting and abuse protection at API boundary.
- Add optional CAPTCHA solving integration hooks.