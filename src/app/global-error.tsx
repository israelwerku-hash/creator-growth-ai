"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
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
          backgroundColor: "#050505",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 480,
            padding: "0 24px",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "rgba(128, 0, 32, 0.15)",
              border: "1px solid rgba(128, 0, 32, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px auto",
              fontSize: 32,
            }}
          >
            ⚠️
          </div>

          {/* Title */}
          <h1
            style={{
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.025em",
              margin: "0 0 12px 0",
            }}
          >
            Something went wrong
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: "#71717a",
              fontSize: 14,
              lineHeight: 1.6,
              margin: "0 0 32px 0",
            }}
          >
            A critical error occurred and has been automatically reported to our
            engineering team. We&apos;re on it.
          </p>

          {/* Error digest */}
          {error.digest && (
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "10px 16px",
                marginBottom: 24,
                display: "inline-block",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#52525b",
                  letterSpacing: "0.05em",
                }}
              >
                ERROR ID: {error.digest}
              </span>
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => reset()}
              style={{
                background: "#800020",
                color: "#ffffff",
                border: "none",
                borderRadius: 12,
                padding: "12px 28px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                boxShadow: "0 0 20px rgba(128, 0, 32, 0.3)",
                transition: "filter 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.filter = "brightness(1.15)")
              }
              onMouseOut={(e) => (e.currentTarget.style.filter = "none")}
            >
              Try Again
            </button>

            <a
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.05)",
                color: "#a1a1aa",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "12px 28px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "none",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
              }
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
