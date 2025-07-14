import React from "react";

const NoScriptFallback: React.FC = () => {
  return (
    <>
      <noscript>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#f9fafb",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#374151",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              padding: "2rem",
              textAlign: "center",
              backgroundColor: "white",
              borderRadius: "0.5rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#fef3c7",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "2rem",
              }}
            >
              ⚠️
            </div>

            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: "#111827",
              }}
            >
              JavaScript Required
            </h1>

            <p
              style={{
                fontSize: "1rem",
                marginBottom: "1.5rem",
                lineHeight: "1.6",
                color: "#6b7280",
              }}
            >
              ReBooked Solutions requires JavaScript to function properly.
              Please enable JavaScript in your browser settings to continue.
            </p>

            <div
              style={{
                backgroundColor: "#f3f4f6",
                padding: "1rem",
                borderRadius: "0.375rem",
                marginBottom: "1.5rem",
                textAlign: "left",
              }}
            >
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: "#374151",
                }}
              >
                How to enable JavaScript:
              </h3>
              <ul
                style={{
                  fontSize: "0.875rem",
                  lineHeight: "1.5",
                  color: "#6b7280",
                  listStyle: "disc",
                  paddingLeft: "1.25rem",
                }}
              >
                <li>
                  <strong>Chrome:</strong> Settings → Privacy and Security →
                  Site Settings → JavaScript → Allow
                </li>
                <li>
                  <strong>Firefox:</strong> about:config → javascript.enabled →
                  true
                </li>
                <li>
                  <strong>Safari:</strong> Preferences → Security → Enable
                  JavaScript
                </li>
                <li>
                  <strong>Edge:</strong> Settings → Site permissions →
                  JavaScript → Allow
                </li>
              </ul>
            </div>

            <div
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "1rem",
              }}
            >
              <p>
                Need help? Contact us at{" "}
                <a
                  href="mailto:support@rebooked.co.za"
                  style={{ color: "#059669", textDecoration: "underline" }}
                >
                  support@rebooked.co.za
                </a>
              </p>
            </div>
          </div>
        </div>
      </noscript>
    </>
  );
};

export default NoScriptFallback;
