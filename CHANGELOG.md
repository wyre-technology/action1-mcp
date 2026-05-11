# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Initial scaffold: 4 domains (organizations / endpoints / policies / updates), 5 read-only tools.
- OAuth 2.0 client-credentials auth, region-aware (NorthAmerica / Europe / AsiaPacific / Australia).
- Stdio + Streamable HTTP transports. Gateway-mode credential isolation via AsyncLocalStorage.
- MCPB manifest + Dockerfile + GHCR publishing via semantic-release.
