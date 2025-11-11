// Client-only wrapper for RealtimeVoiceInterface
// This component uses dynamic imports to prevent server bundling
"use client";

import { lazy } from "react";

// Dynamically import the actual component - this prevents it from being bundled in server functions
export const RealtimeVoiceInterface = lazy(
  () => import("./RealtimeVoiceInterface").then((mod) => ({ default: mod.RealtimeVoiceInterface }))
);
