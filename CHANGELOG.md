# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed
- Corrected Action1 REST API paths in `src/sdk/action1-client.ts`: OAuth token endpoint now uses the `/api/3.0/oauth2/token` prefix, and the endpoints/updates/policies resource paths now match the real API (`/endpoints/managed/{org}`, `/updates/{org}`, `/policies/instances/{org}`). Previously every tool call 403'd at the token request. (#22)
- `pack:mcpb` / `validate:mcpb` now invoke `@anthropic-ai/mcpb` instead of the non-existent bare `mcpb` npm package.

### Added
- Initial scaffold: 4 domains (organizations / endpoints / policies / updates), 5 read-only tools.
- OAuth 2.0 client-credentials auth, region-aware (NorthAmerica / Europe / AsiaPacific / Australia).
- Stdio + Streamable HTTP transports. Gateway-mode credential isolation via AsyncLocalStorage.
- MCPB manifest + Dockerfile + GHCR publishing via semantic-release.
