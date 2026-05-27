"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ImportedOpenApiData, parseOpenApiSpec } from "@/lib/openapi";
import { Api, ApiEndpoint, CreateApiRequest, HttpMethod } from "@/lib/types";

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const CATEGORIES = [
  "AI / ML",
  "Finance",
  "Data & Analytics",
  "Developer Tools",
  "Maps & Location",
  "Social",
  "Weather",
  "Entertainment",
  "Other",
];

type HeaderPair = { key: string; value: string };

interface EndpointDraft {
  path: string;
  method: HttpMethod;
  headers: HeaderPair[];
  bodySchema: string;
  querySchema: string;
  costPerRequest: string;
  showHeaders: boolean;
  showBody: boolean;
  showQuery: boolean;
}

export interface ApiFormProps {
  mode: "create" | "edit";
  initialApi?: Api | null;
  submitting: boolean;
  submitError: string;
  onSubmit: (data: CreateApiRequest) => Promise<void>;
}

function emptyEndpoint(): EndpointDraft {
  return {
    path: "/",
    method: "GET",
    headers: [],
    bodySchema: "",
    querySchema: "",
    costPerRequest: "",
    showHeaders: false,
    showBody: false,
    showQuery: false,
  };
}

function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function endpointToDraft(endpoint: ApiEndpoint): EndpointDraft {
  return {
    path: endpoint.path,
    method: endpoint.method,
    headers: endpoint.headers
      ? Object.entries(endpoint.headers).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      : [],
    bodySchema: endpoint.body_schema
      ? JSON.stringify(endpoint.body_schema, null, 2)
      : "",
    querySchema: endpoint.query_params
      ? JSON.stringify(endpoint.query_params, null, 2)
      : "",
    costPerRequest:
      endpoint.cost_per_request != null ? String(endpoint.cost_per_request) : "",
    showHeaders: !!endpoint.headers && Object.keys(endpoint.headers).length > 0,
    showBody: !!endpoint.body_schema,
    showQuery: !!endpoint.query_params,
  };
}

function draftToEndpoint(d: EndpointDraft): ApiEndpoint {
  const headers =
    d.headers.length > 0
      ? Object.fromEntries(d.headers.filter((h) => h.key).map((h) => [h.key, h.value]))
      : null;

  let body_schema: Record<string, unknown> | null = null;
  if (d.bodySchema.trim()) {
    try {
      body_schema = JSON.parse(d.bodySchema);
    } catch {
      body_schema = null;
    }
  }

  let query_params: Record<string, unknown> | null = null;
  if (d.querySchema.trim()) {
    try {
      query_params = JSON.parse(d.querySchema);
    } catch {
      query_params = null;
    }
  }

  const cost =
    d.costPerRequest.trim() === "" ? null : Number.parseFloat(d.costPerRequest);

  return {
    path: d.path,
    method: d.method,
    headers,
    body_schema,
    query_params,
    cost_per_request: Number.isFinite(cost) ? cost : null,
  };
}

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

function isValidJson(s: string): boolean {
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}

export function ApiForm({
  mode,
  initialApi,
  submitting,
  submitError,
  onSubmit,
}: ApiFormProps) {
  const [name, setName] = useState(initialApi?.name ?? "");
  const [description, setDescription] = useState(initialApi?.description ?? "");
  const [category, setCategory] = useState(initialApi?.category ?? "");
  const [baseUrl, setBaseUrl] = useState(initialApi?.base_url ?? "");
  const [endpoints, setEndpoints] = useState<EndpointDraft[]>(
    initialApi?.endpoints.length
      ? initialApi.endpoints.map(endpointToDraft)
      : [emptyEndpoint()],
  );
  const [paymentEnabled, setPaymentEnabled] = useState(
    initialApi?.payment_config?.enabled ?? false,
  );
  const [costPerRequest, setCostPerRequest] = useState(
    initialApi?.payment_config?.cost_per_request != null
      ? String(initialApi.payment_config.cost_per_request)
      : "0.001",
  );
  const [openApiText, setOpenApiText] = useState("");
  const [selectedImportServer, setSelectedImportServer] = useState("");
  const [pendingImport, setPendingImport] = useState<ImportedOpenApiData | null>(null);
  const [importSourceLabel, setImportSourceLabel] = useState("");
  const [importError, setImportError] = useState("");

  useEffect(() => {
    if (!initialApi) return;
    setName(initialApi.name);
    setDescription(initialApi.description ?? "");
    setCategory(initialApi.category ?? "");
    setBaseUrl(initialApi.base_url);
    setEndpoints(
      initialApi.endpoints.length
        ? initialApi.endpoints.map(endpointToDraft)
        : [emptyEndpoint()],
    );
    setPaymentEnabled(initialApi.payment_config?.enabled ?? false);
    setCostPerRequest(
      initialApi.payment_config?.cost_per_request != null
        ? String(initialApi.payment_config.cost_per_request)
        : "0.001",
    );
  }, [initialApi]);

  const importPreview = useMemo(() => {
    if (!pendingImport) return null;
    return `${pendingImport.endpoints.length} endpoint${
      pendingImport.endpoints.length === 1 ? "" : "s"
    }`;
  }, [pendingImport]);

  function addEndpoint() {
    setEndpoints((prev) => [...prev, emptyEndpoint()]);
  }

  function removeEndpoint(i: number) {
    setEndpoints((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateEndpoint(i: number, patch: Partial<EndpointDraft>) {
    setEndpoints((prev) =>
      prev.map((ep, idx) => (idx === i ? { ...ep, ...patch } : ep)),
    );
  }

  function toggleEndpointField(
    i: number,
    field: "showHeaders" | "showBody" | "showQuery",
  ) {
    setEndpoints((prev) =>
      prev.map((ep, idx) => (idx === i ? { ...ep, [field]: !ep[field] } : ep)),
    );
  }

  function addHeader(i: number) {
    updateEndpoint(i, {
      headers: [...endpoints[i].headers, { key: "", value: "" }],
    });
  }

  function updateHeader(
    epIdx: number,
    hIdx: number,
    patch: Partial<HeaderPair>,
  ) {
    const headers = endpoints[epIdx].headers.map((h, i) =>
      i === hIdx ? { ...h, ...patch } : h,
    );
    updateEndpoint(epIdx, { headers });
  }

  function removeHeader(epIdx: number, hIdx: number) {
    updateEndpoint(epIdx, {
      headers: endpoints[epIdx].headers.filter((_, i) => i !== hIdx),
    });
  }

  function handleParsedImport(parsed: ImportedOpenApiData, sourceLabel?: string) {
    setPendingImport(parsed);
    setSelectedImportServer(parsed.servers.length > 0 ? parsed.servers[0].url : "");
    setImportSourceLabel(sourceLabel ?? "");
    setImportError("");
  }

  function parseImportSource(source: string, sourceLabel?: string) {
    setImportError("");
    try {
      const parsed = parseOpenApiSpec(source);
      handleParsedImport(parsed, sourceLabel);
    } catch (err: unknown) {
      setPendingImport(null);
      setSelectedImportServer("");
      setImportError(
        err instanceof Error ? err.message : "Failed to parse OpenAPI spec.",
      );
    }
  }

  async function handleSpecFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setOpenApiText(text);
      parseImportSource(text, file.name);
    } finally {
      event.target.value = "";
    }
  }

  function handleParseSpec() {
    parseImportSource(openApiText, importSourceLabel || "pasted spec");
  }

  function applyImportedSpec() {
    if (!pendingImport) return;
    setEndpoints(pendingImport.endpoints.map(endpointToDraft));
    if (selectedImportServer) {
      setBaseUrl(selectedImportServer);
    }
    if (mode === "create" && !name && pendingImport.title) {
      setName(slugifyName(pendingImport.title));
    }
    if (!description && pendingImport.description) {
      setDescription(pendingImport.description);
    }
    setImportError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !baseUrl.trim()) return;
    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      category: category.trim() || null,
      base_url: baseUrl.trim(),
      endpoints: endpoints.map(draftToEndpoint),
      payment_config: paymentEnabled
        ? { cost_per_request: parseFloat(costPerRequest) || 0, enabled: true }
        : null,
    });
  }

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto w-full">
      <Link
        href="/dashboard"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
      >
        ← back
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-sm font-mono text-foreground">
            {mode === "create" ? "new api" : "edit api"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {mode === "create"
              ? "proxy and monetize any upstream API"
              : "update your upstream API config without changing its public path"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="border border-border p-4 space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                import openapi
              </p>
              <p className="text-xs text-muted-foreground">
                paste a JSON or YAML spec, or upload a file to auto-fill your endpoints.
              </p>
            </div>

            <textarea
              value={openApiText}
              onChange={(e) => {
                setOpenApiText(e.target.value);
                setImportError("");
              }}
              placeholder={
                "openapi: 3.0.0\ninfo:\n  title: Weather API\npaths:\n  /forecast:\n    get:\n      parameters: []"
              }
              rows={8}
              className="w-full bg-transparent border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring font-mono resize-y"
            />

            <div className="flex flex-wrap items-center gap-3">
              <label className="border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                upload spec
                <input
                  type="file"
                  accept=".json,.yaml,.yml,application/json,text/yaml,text/x-yaml"
                  onChange={handleSpecFileChange}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={handleParseSpec}
                disabled={!openApiText.trim()}
                className="border border-foreground bg-foreground text-background px-3 py-2 text-xs hover:bg-transparent hover:text-foreground transition-colors disabled:opacity-40"
              >
                parse spec
              </button>
              {importSourceLabel && (
                <span className="text-xs text-muted-foreground">
                  source: {importSourceLabel}
                </span>
              )}
            </div>

            {importError && <p className="text-xs text-destructive">{importError}</p>}

            {pendingImport && (
              <div className="border border-border p-3 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-foreground font-mono">
                      {pendingImport.title || "Imported OpenAPI spec"}
                    </p>
                    <p className="text-xs text-muted-foreground">{importPreview}</p>
                  </div>
                  <button
                    type="button"
                    onClick={applyImportedSpec}
                    className="border border-foreground bg-foreground text-background px-3 py-2 text-xs hover:bg-transparent hover:text-foreground transition-colors"
                  >
                    import into form
                  </button>
                </div>

                {pendingImport.servers.length > 0 ? (
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest">
                      server
                    </label>
                    <select
                      value={selectedImportServer}
                      onChange={(e) => setSelectedImportServer(e.target.value)}
                      className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring"
                    >
                      {pendingImport.servers.map((server) => (
                        <option key={server.url} value={server.url}>
                          {server.description
                            ? `${server.description} — ${server.url}`
                            : server.url}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    no servers found in spec. set the base URL manually below.
                  </p>
                )}
              </div>
            )}
          </div>

          <Field label="name" required>
            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_-]/g, ""),
                )
              }
              placeholder="my-api"
              required
              readOnly={mode === "edit"}
              className="w-full bg-transparent border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring font-mono read-only:text-muted-foreground"
            />
          </Field>

          <Field label="description">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="what does this API do?"
              className="w-full bg-transparent border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
            />
          </Field>

          <Field label="category">
            <div className="flex gap-2">
              <select
                value={CATEGORIES.includes(category) ? category : ""}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring flex-1"
              >
                <option value="">select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {!CATEGORIES.includes(category) && (
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="or type custom"
                  className="flex-1 bg-transparent border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
                />
              )}
            </div>
          </Field>

          <Field label="base url" required>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              required
              className="w-full bg-transparent border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring font-mono"
            />
          </Field>

          <div
            className={`border p-4 space-y-4 ${
              paymentEnabled
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-amber-500/50 bg-amber-500/10"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  pricing
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`border px-2 py-1 text-xs font-mono ${
                      paymentEnabled
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                        : "border-amber-500/60 bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {paymentEnabled ? "Payments ON" : "Payments OFF"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {paymentEnabled
                      ? "Requests will be billed using your default price unless an endpoint override is set."
                      : "This API will be free unless you enable pricing."}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPaymentEnabled((p) => !p)}
                className={`border px-3 py-2 text-xs transition-colors ${
                  paymentEnabled
                    ? "border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/15"
                    : "border-amber-500/60 text-amber-300 hover:bg-amber-500/15"
                }`}
              >
                {paymentEnabled ? "turn payments off" : "enable payments →"}
              </button>
            </div>

            {paymentEnabled && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-emerald-300">$</span>
                <input
                  type="number"
                  value={costPerRequest}
                  onChange={(e) => setCostPerRequest(e.target.value)}
                  step="0.0001"
                  min="0"
                  placeholder="0.001"
                  className="flex-1 bg-background/60 border border-emerald-500/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-400 font-mono"
                />
                <span className="text-xs text-muted-foreground">
                  default / request
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground uppercase tracking-widest">
                endpoints
              </label>
              <button
                type="button"
                onClick={addEndpoint}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                + add
              </button>
            </div>

            <div className="space-y-3">
              {endpoints.map((ep, i) => (
                <div key={i} className="border border-border">
                  <div className="flex items-stretch">
                    <select
                      value={ep.method}
                      onChange={(e) =>
                        updateEndpoint(i, {
                          method: e.target.value as HttpMethod,
                        })
                      }
                      className={`bg-background border-r border-border px-2 py-2 text-xs focus:outline-none font-mono shrink-0 ${methodClass(
                        ep.method,
                      )}`}
                    >
                      {HTTP_METHODS.map((m) => (
                        <option key={m} value={m} className="text-foreground">
                          {m}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={ep.path}
                      onChange={(e) => updateEndpoint(i, { path: e.target.value })}
                      placeholder="/path"
                      className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono min-w-0"
                    />

                    {paymentEnabled && (
                      <div className="border-l border-border px-3 py-2 min-w-44 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">$</span>
                          <input
                            type="number"
                            value={ep.costPerRequest}
                            onChange={(e) =>
                              updateEndpoint(i, { costPerRequest: e.target.value })
                            }
                            step="0.0001"
                            min="0"
                            placeholder={costPerRequest || "0.001"}
                            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {ep.costPerRequest.trim()
                            ? "endpoint override"
                            : "uses default"}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center border-l border-border">
                      <button
                        type="button"
                        onClick={() => toggleEndpointField(i, "showHeaders")}
                        title="Headers"
                        className={`px-2.5 py-2 text-xs transition-colors border-r border-border ${
                          ep.showHeaders
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        H{ep.headers.length > 0 ? `(${ep.headers.length})` : ""}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleEndpointField(i, "showBody")}
                        title="Body schema"
                        className={`px-2.5 py-2 text-xs transition-colors border-r border-border ${
                          ep.showBody
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleEndpointField(i, "showQuery")}
                        title="Query params"
                        className={`px-2.5 py-2 text-xs transition-colors ${
                          endpoints.length > 1 ? "border-r border-border" : ""
                        } ${
                          ep.showQuery
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Q
                      </button>
                      {endpoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEndpoint(i)}
                          className="px-2.5 py-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {ep.showHeaders && (
                    <div className="border-t border-border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">request headers</p>
                        <button
                          type="button"
                          onClick={() => addHeader(i)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          + add
                        </button>
                      </div>
                      {ep.headers.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">
                          no headers
                        </p>
                      ) : (
                        ep.headers.map((h, hi) => (
                          <div key={hi} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={h.key}
                              onChange={(e) =>
                                updateHeader(i, hi, { key: e.target.value })
                              }
                              placeholder="Header-Name"
                              className="flex-1 bg-transparent border border-border px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring font-mono"
                            />
                            <span className="text-muted-foreground text-xs">:</span>
                            <input
                              type="text"
                              value={h.value}
                              onChange={(e) =>
                                updateHeader(i, hi, { value: e.target.value })
                              }
                              placeholder="value"
                              className="flex-1 bg-transparent border border-border px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
                            />
                            <button
                              type="button"
                              onClick={() => removeHeader(i, hi)}
                              className="text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {ep.showBody && (
                    <div className="border-t border-border p-3 space-y-2">
                      <p className="text-xs text-muted-foreground">body schema (JSON)</p>
                      <textarea
                        value={ep.bodySchema}
                        onChange={(e) => updateEndpoint(i, { bodySchema: e.target.value })}
                        placeholder={"{\n  \"field\": \"string\"\n}"}
                        rows={4}
                        className="w-full bg-transparent border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring font-mono resize-none"
                      />
                      {ep.bodySchema.trim() && !isValidJson(ep.bodySchema) && (
                        <p className="text-xs text-destructive">invalid JSON</p>
                      )}
                    </div>
                  )}

                  {ep.showQuery && (
                    <div className="border-t border-border p-3 space-y-2">
                      <p className="text-xs text-muted-foreground">query params (JSON schema)</p>
                      <textarea
                        value={ep.querySchema}
                        onChange={(e) => updateEndpoint(i, { querySchema: e.target.value })}
                        placeholder={
                          '{\n  "type": "object",\n  "properties": {\n    "limit": { "type": "integer" }\n  }\n}'
                        }
                        rows={5}
                        className="w-full bg-transparent border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring font-mono resize-none"
                      />
                      {ep.querySchema.trim() && !isValidJson(ep.querySchema) && (
                        <p className="text-xs text-destructive">invalid JSON</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {submitError && <p className="text-xs text-destructive">{submitError}</p>}

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="border border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !name || !baseUrl}
              className="flex-1 border border-foreground bg-foreground text-background px-4 py-2.5 text-sm hover:bg-transparent hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting
                ? mode === "create"
                  ? "creating..."
                  : "saving..."
                : mode === "create"
                  ? "create api →"
                  : "save changes →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground uppercase tracking-widest">
        {label}
        {required && <span className="text-muted-foreground ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
