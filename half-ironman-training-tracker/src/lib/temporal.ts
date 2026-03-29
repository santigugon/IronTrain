"use client";

import { Temporal as PolyfillTemporal } from "@js-temporal/polyfill";

declare global {
  // eslint-disable-next-line no-var
  var Temporal: typeof PolyfillTemporal | undefined;
}

// Schedule-X relies on the global Temporal for instanceof checks.
// Ensure globalThis.Temporal points to the same constructors we use.
if (typeof globalThis.Temporal === "undefined" || globalThis.Temporal !== PolyfillTemporal) {
  globalThis.Temporal = PolyfillTemporal;
}

export const Temporal = globalThis.Temporal as typeof PolyfillTemporal;

