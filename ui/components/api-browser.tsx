"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EndpointDocs } from "@/components/endpoint-docs";
import { describeApiPrice, describeEndpointPrice } from "@/lib/pricing";
import { Api } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const IconCopy = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="5" y="5" width="10" height="10" />
    <path d="M3 11V1h10" />
  </svg>
);

export const IconCheck = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="square"
  >
    <path d="M2 8l4 4 8-7" />
  </svg>
);

export const IconX = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="square"
  >
    <path d="M2 2l12 12M14 2L2 14" />
  </svg>
);

export const IconLock = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="2" y="7" width="12" height="8" />
    <path d="M5 7V5a3 3 0 016 0v2" />
  </svg>
);

export const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="square"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 150ms",
    }}
  >
    <path d="M3 6l5 5 5-5" />
  </svg>
);

export const EnigmaLogo = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect
      x="1"
      y="1"
      width="14"
      height="14"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect x="5" y="5" width="6" height="6" fill="currentColor" />
  </svg>
);

export function methodClass(method: string): string {
  switch (method) {
    case "GET":
      return "text-emerald-400";
    case "POST":
      return "text-blue-400";
    case "PUT":
      return "text-amber-400";
    case "DELETE":
      return "text-red-400";
    case "PATCH":
      return "text-violet-400";
    default:
      return "text-muted-foreground";
  }
}

export function ApiDetailModal({
  api,
  onClose,
}: {
  api: Api;
  onClose: () => void;
}) {
  const proxyBase = `${API_URL}/${api.user_name}/${api.name}`;
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedEp, setExpandedEp] = useState<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4 py-12 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border w-full max-w-lg my-auto">
        {/* Header */}
        <div className="border-b border-border px-5 py-4 flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono text-foreground">{api.name}</p>
              {api.payment_config?.enabled ? (
                <span className="flex items-center gap-1 text-[10px] border border-border px-1.5 py-0.5 text-muted-foreground shrink-0">
                  <IconLock />{describeApiPrice(api)}
                </span>
              ) : (
                <span className="text-[10px] border border-border px-1.5 py-0.5 text-muted-foreground shrink-0">
                  free
                </span>
              )}
            </div>
            {api.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {api.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">by @{api.user_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
          >
            <IconX />
          </button>
        </div>
        <div className="p-5 space-y-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              endpoints ({api.endpoints.length})
            </p>
            <div className="border border-border divide-y divide-border">
              {api.endpoints.map((ep, i) => {
                const headers = ep.headers
                  ? Object.entries(ep.headers as Record<string, string>)
                  : [];
                const hasBody =
                  !!ep.body_schema && Object.keys(ep.body_schema).length > 0;
                const hasQuery =
                  !!ep.query_params && Object.keys(ep.query_params).length > 0;
                const hasDetails = headers.length > 0 || hasBody || hasQuery;
                const isOpen = expandedEp === i;

                return (
                  <div key={i}>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 transition-colors text-left"
                      onClick={() =>
                        hasDetails && setExpandedEp(isOpen ? null : i)
                      }
                      disabled={!hasDetails}
                    >
                      <span
                        className={`text-xs font-mono w-14 shrink-0 ${methodClass(
                          ep.method,
                        )}`}
                      >
                        {ep.method}
                      </span>
                      <span className="text-xs font-mono text-foreground truncate flex-1">
                        {ep.path}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {api.payment_config?.enabled ? (
                          <span className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 font-mono">
                            {describeEndpointPrice(api, ep)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            free
                          </span>
                        )}
                        {hasDetails && <IconChevron open={isOpen} />}
                      </div>
                    </button>

                    {isOpen && hasDetails && (
                      <div className="border-t border-border bg-muted/20 px-3 py-3 space-y-3">
                        <EndpointDocs endpoint={ep} compact />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              proxy endpoint
            </p>
            <div className="border border-border px-3 py-2.5 flex items-center justify-between gap-3 group">
              <code className="text-xs font-mono text-foreground truncate">
                {proxyBase}
              </code>
              <button
                onClick={() => copy(proxyBase, "proxy")}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                {copied === "proxy" ? <IconCheck /> : <IconCopy />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Replace your API base URL with this endpoint.
              {api.payment_config?.enabled &&
                " Callers are billed automatically per request."}
            </p>
          </div>

          {api.category && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">
                category
              </span>
              <span className="text-xs text-foreground">{api.category}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ApiCard({
  api,
  href,
  onClick,
}: {
  api: Api;
  href?: string;
  onClick?: () => void;
}) {
  const uniqueMethods = [...new Set(api.endpoints.map((e) => e.method))];
  const shown = uniqueMethods.slice(0, 3);
  const extra = uniqueMethods.length - 3;
  const className =
    "block w-full text-left border border-border p-4 space-y-3 hover:bg-accent transition-colors group";
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <p className="text-sm text-foreground font-mono truncate">
            {api.name}
          </p>
          {api.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {api.description}
            </p>
          )}
        </div>
        {api.payment_config?.enabled ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground border border-border px-1.5 py-0.5 shrink-0 font-mono">
            <IconLock />{describeApiPrice(api)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground shrink-0">free</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">@{api.user_name}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground shrink-0">
            {api.endpoints.length} ep{api.endpoints.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {shown.map((m) => (
              <span
                key={m}
                className={`text-[10px] font-mono ${methodClass(m)}`}
              >
                {m}
              </span>
            ))}
            {extra > 0 && (
              <span className="text-[10px] text-muted-foreground">
                +{extra}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}
