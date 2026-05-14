"use client";

import { useEffect } from "react";

// Registers the service worker once the page has loaded. Production only —
// a caching SW in dev just gets in the way of hot reloads.
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // A failed registration shouldn't break the app — offline support is
        // a progressive enhancement.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
