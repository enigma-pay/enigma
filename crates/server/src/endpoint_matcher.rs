use shared::{Api, ApiEndpoint, HttpMethod, PaymentConfig};

#[derive(Debug, Clone)]
pub struct MatchedEndpoint<'a> {
    pub endpoint: &'a ApiEndpoint,
    pub score: EndpointMatchScore,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct EndpointMatchScore {
    literal_segments: usize,
    segment_count: usize,
}

pub fn find_matching_endpoint<'a>(
    api: &'a Api,
    method: &HttpMethod,
    request_path: &str,
) -> Option<MatchedEndpoint<'a>> {
    api.endpoints
        .iter()
        .filter_map(|endpoint| {
            match_endpoint(endpoint, method, request_path)
                .map(|score| MatchedEndpoint { endpoint, score })
        })
        .max_by_key(|matched| matched.score)
}

pub fn resolve_request_price(api: &Api, method: &HttpMethod, request_path: &str) -> Option<f64> {
    let PaymentConfig {
        cost_per_request,
        enabled,
    } = api.payment_config.as_ref()?.clone();

    if !enabled {
        return None;
    }

    Some(
        find_matching_endpoint(api, method, request_path)
            .and_then(|matched| matched.endpoint.cost_per_request)
            .unwrap_or(cost_per_request),
    )
}

fn match_endpoint(
    endpoint: &ApiEndpoint,
    method: &HttpMethod,
    request_path: &str,
) -> Option<EndpointMatchScore> {
    if !http_methods_match(&endpoint.method, method) {
        return None;
    }

    let endpoint_segments = normalize_path(&endpoint.path);
    let request_segments = normalize_path(request_path);

    if endpoint_segments.len() != request_segments.len() {
        return None;
    }

    let mut literal_segments = 0;
    for (pattern, actual) in endpoint_segments.iter().zip(request_segments.iter()) {
        if is_template_segment(pattern) {
            continue;
        }

        if pattern != actual {
            return None;
        }

        literal_segments += 1;
    }

    Some(EndpointMatchScore {
        literal_segments,
        segment_count: endpoint_segments.len(),
    })
}

fn http_methods_match(lhs: &HttpMethod, rhs: &HttpMethod) -> bool {
    std::mem::discriminant(lhs) == std::mem::discriminant(rhs)
}

fn normalize_path(path: &str) -> Vec<&str> {
    path.split('?')
        .next()
        .unwrap_or(path)
        .trim_matches('/')
        .split('/')
        .filter(|segment| !segment.is_empty())
        .collect()
}

fn is_template_segment(segment: &str) -> bool {
    segment.starts_with('{') && segment.ends_with('}') && segment.len() > 2
}

#[cfg(test)]
mod tests {
    use super::{find_matching_endpoint, resolve_request_price};
    use shared::{Api, ApiEndpoint, HttpMethod, PaymentConfig};
    use uuid::Uuid;

    fn endpoint(path: &str, method: HttpMethod, cost_per_request: Option<f64>) -> ApiEndpoint {
        ApiEndpoint {
            path: path.to_string(),
            method,
            headers: None,
            body_schema: None,
            query_params: None,
            cost_per_request,
        }
    }

    fn api(endpoints: Vec<ApiEndpoint>, payment_config: Option<PaymentConfig>) -> Api {
        Api {
            id: Uuid::nil(),
            user_name: "alice".to_string(),
            name: "weather".to_string(),
            description: None,
            category: None,
            base_url: "https://example.com".to_string(),
            endpoints,
            payment_config,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        }
    }

    #[test]
    fn matches_exact_literal_path() {
        let api = api(vec![endpoint("/users/list", HttpMethod::GET, None)], None);

        let matched = find_matching_endpoint(&api, &HttpMethod::GET, "/users/list");

        assert!(matched.is_some());
        assert_eq!(matched.unwrap().endpoint.path, "/users/list");
    }

    #[test]
    fn matches_templated_path() {
        let api = api(vec![endpoint("/users/{id}", HttpMethod::GET, None)], None);

        let matched = find_matching_endpoint(&api, &HttpMethod::GET, "/users/42");

        assert!(matched.is_some());
        assert_eq!(matched.unwrap().endpoint.path, "/users/{id}");
    }

    #[test]
    fn method_mismatch_does_not_match() {
        let api = api(vec![endpoint("/users/{id}", HttpMethod::POST, None)], None);

        let matched = find_matching_endpoint(&api, &HttpMethod::GET, "/users/42");

        assert!(matched.is_none());
    }

    #[test]
    fn prefers_more_specific_path() {
        let api = api(
            vec![
                endpoint("/users/{id}", HttpMethod::GET, Some(0.2)),
                endpoint("/users/me", HttpMethod::GET, Some(0.4)),
            ],
            Some(PaymentConfig {
                cost_per_request: 0.1,
                enabled: true,
            }),
        );

        let matched = find_matching_endpoint(&api, &HttpMethod::GET, "/users/me");

        assert_eq!(matched.unwrap().endpoint.path, "/users/me");
    }

    #[test]
    fn endpoint_override_price_wins() {
        let api = api(
            vec![endpoint("/users/{id}", HttpMethod::GET, Some(0.25))],
            Some(PaymentConfig {
                cost_per_request: 0.1,
                enabled: true,
            }),
        );

        let price = resolve_request_price(&api, &HttpMethod::GET, "/users/42");

        assert_eq!(price, Some(0.25));
    }

    #[test]
    fn falls_back_to_api_default_price() {
        let api = api(
            vec![endpoint("/users/{id}", HttpMethod::GET, None)],
            Some(PaymentConfig {
                cost_per_request: 0.1,
                enabled: true,
            }),
        );

        let price = resolve_request_price(&api, &HttpMethod::GET, "/users/42");

        assert_eq!(price, Some(0.1));
    }

    #[test]
    fn disabled_payment_returns_none() {
        let api = api(
            vec![endpoint("/users/{id}", HttpMethod::GET, Some(0.25))],
            Some(PaymentConfig {
                cost_per_request: 0.1,
                enabled: false,
            }),
        );

        let price = resolve_request_price(&api, &HttpMethod::GET, "/users/42");

        assert_eq!(price, None);
    }
}
