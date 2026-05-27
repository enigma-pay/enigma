// Endpoint documentation component
"use client";

import { useState } from "react";
import { ApiEndpoint } from "@/lib/types";

type JsonValue = Record<string, unknown>;

type EndpointField = {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  enumValues?: string[];
  defaultPreview?: string;
};

type SectionData = {
  fields: EndpointField[];
  raw: Record<string, unknown> | null;
};

function asObject(value: unknown): JsonValue | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonValue;
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function inferType(schema: JsonValue | null): string {
  if (!schema) return "any";
  if (typeof schema.type === "string") {
    if (schema.type === "array") {
      const items = asObject(schema.items);
      const itemType = items ? inferType(items) : "any";
      return `${itemType}[]`;
    }
    return schema.type;
  }
  if (Array.isArray(schema.enum)) return "enum";
  if (schema.properties && typeof schema.properties === "object") return "object";
  return "any";
}

function normalizeEnumValues(schema: JsonValue | null): string[] | undefined {
  const values = Array.isArray(schema?.enum) ? schema.enum : null;
  if (!values || values.length === 0) return undefined;
  return values.map((value) => JSON.stringify(value));
}

function previewDefault(schema: JsonValue | null): string | undefined {
  if (!schema) return undefined;
  if ("default" in schema) return JSON.stringify(schema.default);
  if ("example" in schema) return JSON.stringify(schema.example);
  return undefined;
}

function normalizeSchemaSection(schema: unknown): SectionData {
  const root = asObject(schema);
  if (!root) {
    return { fields: [], raw: null };
  }

  const properties = asObject(root.properties);
  if (!properties) {
    return { fields: [], raw: root };
  }

  const requiredNames = new Set(asStringArray(root.required));
  const fields = Object.entries(properties).map(([name, value]) => {
    const propertySchema = asObject(value);
    return {
      name,
      type: inferType(propertySchema),
      required: requiredNames.has(name),
      description:
        propertySchema && typeof propertySchema.description === "string"
          ? propertySchema.description
          : undefined,
      enumValues: normalizeEnumValues(propertySchema),
      defaultPreview: previewDefault(propertySchema),
    };
  });

  return {
    fields,
    raw: fields.length > 0 ? null : root,
  };
}

function normalizeHeaders(headers: ApiEndpoint["headers"]): SectionData {
  if (!headers) return { fields: [], raw: null };
  const entries = Object.entries(headers);
  if (entries.length === 0) return { fields: [], raw: null };
  return {
    fields: entries.map(([name, value]) => ({
      name,
      type: "string",
      required: false,
      defaultPreview: value,
    })),
    raw: null,
  };
}

function ParameterSection({
  title,
  data,
  compact = false,
}: {
  title: string;
  data: SectionData;
  compact?: boolean;
}) {
  const [showRaw, setShowRaw] = useState(false);
  const [expandedEnums, setExpandedEnums] = useState<Record<string, boolean>>({});
  const initialEnumCount = compact ? 2 : 4;

  if (data.fields.length === 0 && !data.raw) {
    return null;
  }

  return (
    <div
      className={
        compact
          ? "space-y-2"
          : "border-l border-border pl-3 space-y-3"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          {title}
        </p>
        {data.raw && (
          <button
            type="button"
            onClick={() => setShowRaw((value) => !value)}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {showRaw ? "hide raw" : "show raw"}
          </button>
        )}
      </div>

      {data.fields.length > 0 ? (
        <div className="border border-border divide-y divide-border">
          {data.fields.map((field) => (
            <div
              key={field.name}
              className="px-3 py-2.5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-foreground">
                    {field.name}
                  </span>
                  <span className="text-[10px] border border-border px-1.5 py-0.5 text-muted-foreground">
                    {field.type}
                  </span>
                  {field.required && (
                    <span className="text-[10px] border border-border px-1.5 py-0.5 text-foreground">
                      required
                    </span>
                  )}
                </div>
                {field.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {field.description}
                  </p>
                )}
              </div>
              <div className="min-w-0 text-left sm:text-right space-y-1 shrink-0">
                {field.enumValues && (
                  <EnumValues
                    fieldName={field.name}
                    values={field.enumValues}
                    expanded={!!expandedEnums[field.name]}
                    initialCount={initialEnumCount}
                    onToggle={() =>
                      setExpandedEnums((current) => ({
                        ...current,
                        [field.name]: !current[field.name],
                      }))
                    }
                  />
                )}
                {field.defaultPreview && (
                  <p className="text-[10px] text-muted-foreground max-w-56">
                    default: {field.defaultPreview}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {data.raw && showRaw && (
        <pre className="text-xs text-muted-foreground overflow-x-auto border border-border p-3">
          {JSON.stringify(data.raw, null, 2)}
        </pre>
      )}
    </div>
  );
}

function EnumValues({
  fieldName,
  values,
  expanded,
  initialCount,
  onToggle,
}: {
  fieldName: string;
  values: string[];
  expanded: boolean;
  initialCount: number;
  onToggle: () => void;
}) {
  const visibleValues = expanded ? values : values.slice(0, initialCount);
  const hasHiddenValues = values.length > initialCount;

  return (
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground">enum</p>
      <div className="flex flex-wrap justify-start sm:justify-end gap-1 max-w-72">
        {visibleValues.map((value) => (
          <span
            key={`${fieldName}-${value}`}
            className="border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono"
          >
            {value}
          </span>
        ))}
        {hasHiddenValues && (
          <button
            type="button"
            onClick={onToggle}
            className="border border-border px-1.5 py-0.5 text-[10px] text-foreground hover:bg-accent transition-colors"
          >
            {expanded ? "show less" : `show ${values.length - initialCount} more`}
          </button>
        )}
      </div>
    </div>
  );
}

export function EndpointDocs({
  endpoint,
  compact = false,
}: {
  endpoint: ApiEndpoint;
  compact?: boolean;
}) {
  const headers = normalizeHeaders(endpoint.headers);
  const body = normalizeSchemaSection(endpoint.body_schema);
  const query = normalizeSchemaSection(endpoint.query_params);

  const spacing = compact ? "space-y-3" : "space-y-4";

  return (
    <div className={spacing}>
      <ParameterSection title="headers" data={headers} compact={compact} />
      <ParameterSection title="query params" data={query} compact={compact} />
      <ParameterSection title="body" data={body} compact={compact} />
    </div>
  );
}
