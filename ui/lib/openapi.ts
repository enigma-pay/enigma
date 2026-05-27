import { parse as parseYaml } from "yaml";
import { ApiEndpoint, HttpMethod } from "./types";

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

type JsonRecord = Record<string, unknown>;

interface OpenApiServer {
  url: string;
  description?: string;
}

export interface ImportedOpenApiData {
  title: string;
  description: string;
  servers: OpenApiServer[];
  endpoints: ApiEndpoint[];
}

interface OpenApiParameter {
  in?: string;
  name?: string;
  example?: unknown;
  schema?: JsonRecord;
}

interface OpenApiOperation {
  parameters?: OpenApiParameter[];
  requestBody?: {
    content?: Record<string, { schema?: JsonRecord }>;
  };
}

function asObject(value: unknown): JsonRecord | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonRecord;
  }
  return null;
}

function normalizeMethod(value: string): HttpMethod | null {
  const upper = value.toUpperCase() as HttpMethod;
  return HTTP_METHODS.includes(upper) ? upper : null;
}

function buildQuerySchema(parameters: OpenApiParameter[]): JsonRecord | null {
  const queryParams = parameters.filter((parameter) => parameter.in === "query" && parameter.name);
  if (queryParams.length === 0) return null;

  const properties = Object.fromEntries(
    queryParams.map((parameter) => [
      parameter.name as string,
      asObject(parameter.schema) ?? { type: "string" },
    ]),
  );

  return {
    type: "object",
    properties,
  };
}

function buildHeaders(parameters: OpenApiParameter[]): Record<string, string> | null {
  const headerParams = parameters.filter((parameter) => parameter.in === "header" && parameter.name);
  if (headerParams.length === 0) return null;

  return Object.fromEntries(
    headerParams.map((parameter) => {
      const schemaDefault = asObject(parameter.schema)?.default;
      const value = parameter.example ?? schemaDefault ?? "";
      return [parameter.name as string, String(value)];
    }),
  );
}

function buildBodySchema(operation: OpenApiOperation): JsonRecord | null {
  const jsonBody = operation.requestBody?.content?.["application/json"]?.schema;
  return asObject(jsonBody);
}

export function parseOpenApiSpec(source: string): ImportedOpenApiData {
  const raw = source.trim();
  if (!raw) {
    throw new Error("OpenAPI spec is empty.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    try {
      parsed = parseYaml(raw);
    } catch (error) {
      throw new Error(
        error instanceof Error ? `Failed to parse spec: ${error.message}` : "Failed to parse spec.",
      );
    }
  }

  const document = asObject(parsed);
  if (!document) {
    throw new Error("OpenAPI spec must be an object.");
  }

  const paths = asObject(document.paths);
  if (!paths) {
    throw new Error("OpenAPI spec is missing a valid paths object.");
  }

  const endpoints: ApiEndpoint[] = [];
  for (const [path, pathValue] of Object.entries(paths)) {
    const operations = asObject(pathValue);
    if (!operations) continue;

    for (const [methodKey, operationValue] of Object.entries(operations)) {
      const method = normalizeMethod(methodKey);
      if (!method) continue;

      const operation = asObject(operationValue) as OpenApiOperation | null;
      const parameters = Array.isArray(operation?.parameters) ? operation.parameters : [];

      endpoints.push({
        path,
        method,
        headers: buildHeaders(parameters),
        query_params: buildQuerySchema(parameters),
        body_schema: operation ? buildBodySchema(operation) : null,
        cost_per_request: null,
      });
    }
  }

  if (endpoints.length === 0) {
    throw new Error("No supported HTTP operations were found in the OpenAPI spec.");
  }

  const info = asObject(document.info);
  const servers = Array.isArray(document.servers)
    ? document.servers
        .map((server) => asObject(server))
        .filter((server): server is JsonRecord => !!server && typeof server.url === "string")
        .map((server) => ({
          url: String(server.url),
          description:
            typeof server.description === "string" ? String(server.description) : undefined,
        }))
    : [];

  return {
    title: typeof info?.title === "string" ? info.title : "",
    description: typeof info?.description === "string" ? info.description : "",
    servers,
    endpoints,
  };
}
