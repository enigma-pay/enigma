import { Api, ApiEndpoint } from "./types";

export function formatPrice(amount: number, digits = 4): string {
  return `$${amount.toFixed(digits)}`;
}

export function getEndpointPrice(
  api: Pick<Api, "payment_config">,
  endpoint: Pick<ApiEndpoint, "cost_per_request">,
): number | null {
  if (!api.payment_config?.enabled) return null;
  return endpoint.cost_per_request ?? api.payment_config.cost_per_request;
}

export function describeEndpointPrice(
  api: Pick<Api, "payment_config">,
  endpoint: Pick<ApiEndpoint, "cost_per_request">,
): string {
  const price = getEndpointPrice(api, endpoint);
  if (price === null) return "free";
  return formatPrice(price);
}

export function describeApiPrice(api: Pick<Api, "payment_config" | "endpoints">): string {
  if (!api.payment_config?.enabled) return "free";
  const hasOverrides = api.endpoints.some((ep) => ep.cost_per_request != null);
  if (!hasOverrides) return `${formatPrice(api.payment_config.cost_per_request)} / req`;
  return `${formatPrice(api.payment_config.cost_per_request)} default`;
}
