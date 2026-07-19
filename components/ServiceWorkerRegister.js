"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability is a nice-to-have; if registration fails
        // (e.g. unsupported browser) the site still works normally.
      });
    }
  }, []);

  return null;
}
