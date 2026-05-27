// API detail view component
"use client";

import { useState } from "react";
import Link from "next/link";
import { EndpointDocs } from "@/components/endpoint-docs";
import { UserAvatar } from "@/components/user-avatar";
import { describeApiPrice, describeEndpointPrice, formatPrice } from "@/lib/pricing";
import { Api, User } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const IconCopy = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="5" y="5" width="10" height="10" />
    <path d="M3 11V1h10" />
  </svg>
);

const IconCheck = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="square"
  >
    <path d="M2 8l4 4 8-7" />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 150ms",
    }}
  >
    <path d="M3 6l5 5 5-5" />
  </svg>
);

const IconEdit = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="square"
  >
    <path d="M2 11.5V14h2.5L12 6.5 9.5 4 2 11.5z" />
    <path d="M8.5 5l2.5 2.5" />
    <path d="M10 3.5l1-1 2.5 2.5-1 1" />
  </svg>
);

const IconTrash = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="square"
  >
    <path d="M2 4h12" />
    <path d="M6 4V2h4v2" />
    <path d="M4 4l1 10h6l1-10" />
    <path d="M7 7v4" />
    <path d="M9 7v4" />
  </svg>
);

function methodClass(method: string): string {
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ApiDetailView({
  api,
  variant,
  backHref,
  backLabel = "back",
  owner,
  onDelete,
  deleting = false,
}: {
  api: Api;
  variant: "owner" | "public";
  backHref: string;
  backLabel?: string;
  owner?: Pick<User, "user_name" | "avatar_id">;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [expandedEp, setExpandedEp] = useState<number | null>(null);
  const proxyBase = `${API_URL}/${api.user_name}/${api.name}`;
  const isOwner = variant === "owner";

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto w-full space-y-8">
      <Link
        href={backHref}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {backLabel}
      </Link>

      <div className="space-y-4 pb-7 border-b border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-sm font-mono text-foreground">{api.name}</h1>
              {api.category && (
                <span className="text-xs text-muted-foreground border border-border px-1.5 py-0.5">
                  {api.category}
                </span>
              )}
              {api.payment_config?.enabled && (
                <span className="text-xs text-muted-foreground border border-border px-1.5 py-0.5 font-mono">
                  {describeApiPrice(api)}
                </span>
              )}
            </div>
            {api.description && (
              <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
                {api.description}
              </p>
            )}
          </div>

          {isOwner && (
            <div className="flex items-center gap-4 shrink-0">
              <Link
                href={`/dashboard/${api.name}/edit`}
                className="inline-flex items-center gap-1.5 text-xs text-sky-300/90 hover:text-sky-200 transition-colors"
              >
                <IconEdit />
                edit
              </Link>
              <button
                onClick={onDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 text-xs text-destructive hover:text-red-300 transition-colors disabled:opacity-40"
              >
                <IconTrash />
                {deleting ? "deleting..." : "delete"}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {!isOwner && owner && (
            <Link
              href={`/${owner.user_name}`}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <UserAvatar
                avatarId={owner.avatar_id}
                name={owner.user_name}
                size="xs"
                className="border-0"
              />
              @{owner.user_name}
            </Link>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>created</span>
            <span className="font-mono text-foreground">
              {formatDate(api.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>endpoints</span>
            <span className="font-mono text-foreground">{api.endpoints.length}</span>
          </div>
        </div>
      </div>

      <Section label="proxy url">
        <CopyRow
          label="endpoint"
          value={proxyBase}
          onCopy={() => copyToClipboard(proxyBase, "proxy")}
          copied={copied === "proxy"}
        />
        <p className="text-xs text-muted-foreground">
          Use this URL instead of your base URL.
          {api.payment_config?.enabled &&
            " Callers are billed automatically per request."}
        </p>
      </Section>

      <Section label={`endpoints (${api.endpoints.length})`}>
        {api.endpoints.length === 0 ? (
          <p className="text-xs text-muted-foreground">no endpoints defined</p>
        ) : (
          <div className="border border-border divide-y divide-border">
            {api.endpoints.map((ep, i) => {
              const proxyUrl = `${proxyBase}${ep.path}`;
              const headers = ep.headers
                ? Object.entries(ep.headers as Record<string, string>)
                : [];
              const hasQueryParams =
                ep.query_params && Object.keys(ep.query_params).length > 0;
              const hasDetails =
                headers.length > 0 || !!ep.body_schema || hasQueryParams;
              const isOpen = expandedEp === i;

              return (
                <div key={i} className="group">
                  <div className="px-3 py-3 flex items-center gap-3">
                    <button
                      onClick={() =>
                        hasDetails && setExpandedEp(isOpen ? null : i)
                      }
                      className="flex items-center gap-4 min-w-0 flex-1 text-left"
                      disabled={!hasDetails}
                    >
                      <span
                        className={`text-xs font-mono shrink-0 w-16 ${methodClass(
                          ep.method,
                        )}`}
                      >
                        {ep.method}
                      </span>
                      <div className="min-w-0 flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-xs font-mono text-foreground truncate">
                          {ep.path}
                        </span>
                        <span className="flex items-center gap-1 flex-wrap">
                          {headers.length > 0 && (
                            <span className="text-[10px] text-muted-foreground border border-border px-1">
                              {headers.length}H
                            </span>
                          )}
                          {ep.body_schema && (
                            <span className="text-[10px] text-muted-foreground border border-border px-1">
                              body
                            </span>
                          )}
                          {hasQueryParams && (
                            <span className="text-[10px] text-muted-foreground border border-border px-1">
                              query
                            </span>
                          )}
                        </span>
                      </div>
                      {api.payment_config?.enabled && (
                        <span className="ml-auto shrink-0 text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 font-mono">
                          {describeEndpointPrice(api, ep)}
                        </span>
                      )}
                      {hasDetails && (
                        <span className="text-muted-foreground shrink-0">
                          <IconChevron open={isOpen} />
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(proxyUrl, `ep-${i}`)}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      {copied === `ep-${i}` ? <IconCheck /> : <IconCopy />}
                    </button>
                  </div>
                  {isOpen && (
                    <div className="border-t border-border bg-muted/30">
                      <div className="px-3 py-3 space-y-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                          request config
                        </p>
                        <EndpointDocs endpoint={ep} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {isOwner && (
        <>
          <Section label="pricing">
            {!api.payment_config ? (
              <p className="text-xs text-muted-foreground">
                free — no billing configured
              </p>
            ) : (
              <div className="space-y-2">
                <Row
                  label="status"
                  value={api.payment_config.enabled ? "enabled" : "disabled"}
                />
                <Row
                  label="default"
                  value={`${formatPrice(
                    api.payment_config.cost_per_request,
                    6,
                  )} / request`}
                />
              </div>
            )}
          </Section>

          <Section label="raw config">
            <button
              onClick={() => setShowRaw((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showRaw ? "hide" : "show"} json
            </button>
            {showRaw && (
              <pre className="text-xs text-muted-foreground overflow-x-auto border border-border p-3 mt-2">
                {JSON.stringify(api, null, 2)}
              </pre>
            )}
          </Section>
        </>
      )}
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-muted-foreground w-32 shrink-0">
        {label}
      </span>
      <span className="text-xs text-foreground font-mono">{value}</span>
    </div>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="border border-border px-3 py-3 flex items-center justify-between gap-3 group">
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xs font-mono text-foreground truncate">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        {copied ? <IconCheck /> : <IconCopy />}
      </button>
    </div>
  );
}
