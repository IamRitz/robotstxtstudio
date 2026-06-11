"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary. Replaces the root layout when an error escapes it, so
 * it must render its own <html>/<body>. globals.css is not guaranteed here, so styles
 * are inline. This should almost never fire — the segment-level error.tsx handles
 * normal page errors.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p
            style={{ fontSize: "0.875rem", color: "#a3a3a3", margin: "0 0 20px", lineHeight: 1.6 }}
          >
            A critical error occurred. Please try again or reload the page.
          </p>
          <button
            onClick={reset}
            style={{
              cursor: "pointer",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 500,
              padding: "10px 20px",
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p style={{ fontSize: "0.75rem", color: "#737373", marginTop: "16px" }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
