/**
 * Domain handlers index — lazy-loaded.
 *
 * Each domain module exports a `<name>Handler: DomainHandler`.
 * Lazy import keeps cold-start fast for clients that don't need all surfaces.
 */

import type { DomainHandler, DomainName } from "../utils/types.js";

const domainCache = new Map<DomainName, DomainHandler>();

export async function getDomainHandler(domain: DomainName): Promise<DomainHandler> {
  const cached = domainCache.get(domain);
  if (cached) return cached;

  let handler: DomainHandler;
  switch (domain) {
    case "endpoints": {
      const { endpointsHandler } = await import("./endpoints.js");
      handler = endpointsHandler;
      break;
    }
    case "organizations": {
      const { organizationsHandler } = await import("./organizations.js");
      handler = organizationsHandler;
      break;
    }
    case "policies": {
      const { policiesHandler } = await import("./policies.js");
      handler = policiesHandler;
      break;
    }
    case "updates": {
      const { updatesHandler } = await import("./updates.js");
      handler = updatesHandler;
      break;
    }
    default:
      throw new Error(`Unknown domain: ${domain satisfies never}`);
  }

  domainCache.set(domain, handler);
  return handler;
}

export function getAvailableDomains(): DomainName[] {
  return ["organizations", "endpoints", "policies", "updates"];
}

export function clearDomainCache(): void {
  domainCache.clear();
}
