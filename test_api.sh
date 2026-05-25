#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
DATABASE_URL="${2:-${DATABASE_URL:-postgres://postgres:password@localhost/enigma}}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
FAIL=0

pass() { echo -e "  ${GREEN}✓${NC} $1"; PASS=$((PASS + 1)); }
fail() { echo -e "  ${RED}✗${NC} $1"; FAIL=$((FAIL + 1)); }
section() { echo -e "\n${CYAN}${BOLD}▶ $1${NC}"; }
info() { echo -e "  ${YELLOW}→${NC} $1"; }

db_query() {
    psql "$DATABASE_URL" -tAq -c "$1" 2>/dev/null
}

assert_eq() {
    local label="$1" expected="$2" actual="$3"
    if [[ "$expected" == "$actual" ]]; then
        pass "$label: '$actual'"
    else
        fail "$label: expected '$expected', got '$actual'"
    fi
}

assert_not_empty() {
    local label="$1" value="$2"
    if [[ -n "$value" && "$value" != "null" ]]; then
        pass "$label: '$value'"
    else
        fail "$label is empty/null"
    fi
}

assert_empty() {
    local label="$1" value="$2"
    if [[ -z "$value" || "$value" == "null" || "$value" == "None" ]]; then
        pass "$label is absent (expected)"
    else
        fail "$label should be absent, got '$value'"
    fi
}

http_post() {
    curl -s -X POST "$BASE_URL$1" \
        -H "Content-Type: application/json" \
        -d "$2"
}

http_get() {
    curl -s -X GET "$BASE_URL$1"
}

http_delete() {
    curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL$1"
}

http_status() {
    curl -s -o /dev/null -w "%{http_code}" -X "$1" "$BASE_URL$2" \
        -H "Content-Type: application/json" \
        ${3:+-d "$3"}
}

json_get() {
    python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(d$1)" 2>/dev/null || echo ""
}

section "Pre-flight checks"
if ! curl -s --max-time 3 "$BASE_URL/healthz" >/dev/null 2>&1; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$BASE_URL/nonexistent_user" || echo "000")
    if [[ "$STATUS" == "000" ]]; then
        echo -e "${RED}${BOLD}ERROR: Server not reachable at $BASE_URL${NC}"
        echo "  Start it with: cargo run"
        exit 1
    fi
fi
pass "Server reachable at $BASE_URL"

if ! command -v psql >/dev/null 2>&1; then
    echo -e "${RED}${BOLD}ERROR: psql not found. Install postgresql-client.${NC}"
    exit 1
fi
if ! psql "$DATABASE_URL" -c "SELECT 1" >/dev/null 2>&1; then
    echo -e "${RED}${BOLD}ERROR: Database not reachable at $DATABASE_URL${NC}"
    exit 1
fi
pass "Database reachable"

SUFFIX=$(date +%s)
USER_NAME="testuser_${SUFFIX}"
EMAIL="test_${SUFFIX}@example.com"
SOL_KEY="So1Ana1ysisTestKey$(echo $SUFFIX | head -c 12)abcde12345" 
SOL_KEY="${SOL_KEY:0:44}"

API_NAME="my-api-${SUFFIX}"
API_NAME2="second-api-${SUFFIX}"

section "1. POST /create_user"
CREATE_USER_BODY=$(cat <<JSON
{
  "user_name": "$USER_NAME",
  "email":     "$EMAIL",
  "sol_public_key": "$SOL_KEY"
}
JSON
)

RESP=$(http_post "/create_user" "$CREATE_USER_BODY")
info "Response: $RESP"

assert_eq   "response.user_name"     "$USER_NAME"  "$(echo "$RESP" | json_get "['user_name']")"
assert_eq   "response.email"         "$EMAIL"       "$(echo "$RESP" | json_get "['email']")"
assert_eq   "response.sol_public_key" "$SOL_KEY"   "$(echo "$RESP" | json_get "['sol_public_key']")"
assert_not_empty "response.created_at" "$(echo "$RESP" | json_get "['created_at']")"

DB_USER_NAME=$(db_query "SELECT user_name FROM users WHERE user_name='$USER_NAME'")
DB_EMAIL=$(db_query "SELECT email FROM users WHERE user_name='$USER_NAME'")
DB_SOL=$(db_query "SELECT sol_public_key FROM users WHERE user_name='$USER_NAME'")

assert_eq "db.user_name"      "$USER_NAME"  "$DB_USER_NAME"
assert_eq "db.email"          "$EMAIL"       "$DB_EMAIL"
assert_eq "db.sol_public_key" "$SOL_KEY"    "$DB_SOL"

section "2. GET /:user_name"
RESP=$(http_get "/$USER_NAME")
info "Response: $RESP"

assert_eq "response.user_name"      "$USER_NAME"  "$(echo "$RESP" | json_get "['user_name']")"
assert_eq "response.email"          "$EMAIL"       "$(echo "$RESP" | json_get "['email']")"
assert_eq "response.sol_public_key" "$SOL_KEY"    "$(echo "$RESP" | json_get "['sol_public_key']")"

DB_CREATED_AT=$(db_query "SELECT created_at FROM users WHERE user_name='$USER_NAME'")
API_CREATED_AT=$(echo "$RESP" | json_get "['created_at']")
assert_not_empty "response.created_at matches db" "$API_CREATED_AT"

section "3. GET /:user_name (not found)"
STATUS=$(http_status "GET" "/user_that_does_not_exist_${SUFFIX}")
assert_eq "HTTP 404 for unknown user" "404" "$STATUS"

section "4. POST /create_user (duplicate user_name)"
STATUS=$(http_status "POST" "/create_user" "$CREATE_USER_BODY")
assert_eq "HTTP 500 on duplicate user_name" "500" "$STATUS"

DB_COUNT=$(db_query "SELECT COUNT(*) FROM users WHERE user_name='$USER_NAME'")
assert_eq "db still has exactly 1 row" "1" "$DB_COUNT"

section "5. POST /:user_name/create_api (minimal)"
CREATE_API_BODY=$(cat <<JSON
{
  "name":        "$API_NAME",
  "description": "A test API",
  "base_url":    "https://api.example.com",
  "endpoints":   [],
  "payment_config": null
}
JSON
)

RESP=$(http_post "/$USER_NAME/create_api" "$CREATE_API_BODY")
info "Response: $RESP"

API_ID=$(echo "$RESP" | json_get "['id']")
assert_not_empty "response.id"          "$API_ID"
assert_eq "response.user_name"          "$USER_NAME"          "$(echo "$RESP" | json_get "['user_name']")"
assert_eq "response.name"               "$API_NAME"            "$(echo "$RESP" | json_get "['name']")"
assert_eq "response.description"        "A test API"           "$(echo "$RESP" | json_get "['description']")"
assert_eq "response.base_url"           "https://api.example.com" "$(echo "$RESP" | json_get "['base_url']")"
assert_eq "response.endpoints"          "[]"                   "$(echo "$RESP" | json_get "['endpoints']")"
assert_empty "response.payment_config"  "$(echo "$RESP" | json_get "['payment_config']")"

DB_API_ID=$(db_query "SELECT id FROM apis WHERE user_name='$USER_NAME' AND name='$API_NAME'")
DB_BASE_URL=$(db_query "SELECT base_url FROM apis WHERE user_name='$USER_NAME' AND name='$API_NAME'")
DB_DESCRIPTION=$(db_query "SELECT description FROM apis WHERE user_name='$USER_NAME' AND name='$API_NAME'")
DB_ENDPOINTS=$(db_query "SELECT endpoints FROM apis WHERE user_name='$USER_NAME' AND name='$API_NAME'")
DB_PAYMENT=$(db_query "SELECT payment_config FROM apis WHERE user_name='$USER_NAME' AND name='$API_NAME'")

assert_not_empty "db.id"           "$DB_API_ID"
assert_eq "db.base_url"            "https://api.example.com" "$DB_BASE_URL"
assert_eq "db.description"         "A test API"              "$DB_DESCRIPTION"
assert_eq "db.endpoints"           "[]"                       "$DB_ENDPOINTS"
assert_empty "db.payment_config"   "$DB_PAYMENT"

assert_eq "response.id matches db.id" "$DB_API_ID" "$API_ID"

section "6. POST /:user_name/create_api (full — endpoints + payment)"
CREATE_API2_BODY=$(cat <<JSON
{
  "name":        "$API_NAME2",
  "description": null,
  "base_url":    "https://data.example.org",
  "endpoints": [
    {
      "path":   "/users",
      "method": "GET",
      "headers": {"Authorization": "Bearer {token}"},
      "body_schema": null,
      "query_params": {"page": "integer"}
    },
    {
      "path":    "/users/{id}",
      "method":  "POST",
      "headers": null,
      "body_schema": {"name": "string", "age": "integer"},
      "query_params": null
    }
  ],
  "payment_config": {
    "cost_per_request": 0.01,
    "enabled": true
  }
}
JSON
)

RESP=$(http_post "/$USER_NAME/create_api" "$CREATE_API2_BODY")
info "Response: $RESP"

API2_ID=$(echo "$RESP" | json_get "['id']")

assert_not_empty "response.id"             "$API2_ID"
assert_eq "response.name"                  "$API_NAME2"              "$(echo "$RESP" | json_get "['name']")"
assert_eq "response.base_url"              "https://data.example.org" "$(echo "$RESP" | json_get "['base_url']")"
assert_empty "response.description"        "$(echo "$RESP" | json_get "['description']")"
assert_eq "response endpoint count"        "2"  "$(echo "$RESP" | json_get "['endpoints'].__len__()")"
assert_eq "response endpoint[0].path"      "/users" "$(echo "$RESP" | json_get "['endpoints'][0]['path']")"
assert_eq "response endpoint[0].method"    "GET"    "$(echo "$RESP" | json_get "['endpoints'][0]['method']")"
assert_eq "response endpoint[1].path"      "/users/{id}" "$(echo "$RESP" | json_get "['endpoints'][1]['path']")"
assert_eq "response endpoint[1].method"    "POST"   "$(echo "$RESP" | json_get "['endpoints'][1]['method']")"
assert_eq "response.payment_config.enabled"          "True"  "$(echo "$RESP" | json_get "['payment_config']['enabled']")"
assert_eq "response.payment_config.cost_per_request" "0.01"  "$(echo "$RESP" | json_get "['payment_config']['cost_per_request']")"

DB_API2_ENDPOINTS=$(db_query "SELECT endpoints FROM apis WHERE id='$API2_ID'")
DB_PAYMENT_ENABLED=$(db_query "SELECT payment_config->>'enabled' FROM apis WHERE id='$API2_ID'")
DB_PAYMENT_COST=$(db_query "SELECT payment_config->>'cost_per_request' FROM apis WHERE id='$API2_ID'")
DB_ENDPOINT_COUNT=$(db_query "SELECT jsonb_array_length(endpoints) FROM apis WHERE id='$API2_ID'")
DB_ENDPOINT0_PATH=$(db_query "SELECT endpoints->0->>'path' FROM apis WHERE id='$API2_ID'")
DB_ENDPOINT0_METHOD=$(db_query "SELECT endpoints->0->>'method' FROM apis WHERE id='$API2_ID'")

assert_eq "db endpoint count"        "2"        "$DB_ENDPOINT_COUNT"
assert_eq "db endpoint[0].path"      "/users"   "$DB_ENDPOINT0_PATH"
assert_eq "db endpoint[0].method"    "GET"      "$DB_ENDPOINT0_METHOD"
assert_eq "db payment_config.enabled"           "true" "$DB_PAYMENT_ENABLED"
assert_eq "db payment_config.cost_per_request"  "0.01" "$DB_PAYMENT_COST"

section "7. GET /:user_name/:api_name"
RESP=$(http_get "/$USER_NAME/$API_NAME")
info "Response: $RESP"

assert_eq "response.id"          "$API_ID"    "$(echo "$RESP" | json_get "['id']")"
assert_eq "response.name"        "$API_NAME"  "$(echo "$RESP" | json_get "['name']")"
assert_eq "response.user_name"   "$USER_NAME" "$(echo "$RESP" | json_get "['user_name']")"
assert_eq "response.base_url"    "https://api.example.com" "$(echo "$RESP" | json_get "['base_url']")"

RESP2=$(http_get "/$USER_NAME/$API_NAME2")
assert_eq "response.id (api2)"   "$API2_ID"   "$(echo "$RESP2" | json_get "['id']")"

section "8. GET /:user_name/:api_name (not found)"
STATUS=$(http_status "GET" "/$USER_NAME/no-such-api-${SUFFIX}")
assert_eq "HTTP 404 for unknown api" "404" "$STATUS"

section "9. POST /:user_name/create_api (user not found)"
STATUS=$(http_status "POST" "/no_such_user_${SUFFIX}/create_api" "$CREATE_API_BODY")
assert_eq "HTTP 404 when user missing" "404" "$STATUS"

section "10. DELETE /:user_name/:api_name"
STATUS=$(http_delete "/$USER_NAME/$API_NAME")
assert_eq "HTTP 204 on delete" "204" "$STATUS"

DB_COUNT=$(db_query "SELECT COUNT(*) FROM apis WHERE id='$API_ID'")
assert_eq "db row deleted"  "0" "$DB_COUNT"

STATUS=$(http_status "GET" "/$USER_NAME/$API_NAME")
assert_eq "HTTP 404 after delete" "404" "$STATUS"

DB_COUNT2=$(db_query "SELECT COUNT(*) FROM apis WHERE id='$API2_ID'")
assert_eq "db second api untouched" "1" "$DB_COUNT2"

section "11. DELETE /:user_name/:api_name (not found)"
STATUS=$(http_delete "/$USER_NAME/already-deleted-${SUFFIX}")
assert_eq "HTTP 404 deleting non-existent api" "404" "$STATUS"

section "12. DB cascade: deleting user removes their APIs"

db_query "DELETE FROM users WHERE user_name='$USER_NAME'" >/dev/null
DB_USER=$(db_query "SELECT COUNT(*) FROM users WHERE user_name='$USER_NAME'")
DB_APIS=$(db_query "SELECT COUNT(*) FROM apis  WHERE user_name='$USER_NAME'")

assert_eq "db user deleted" "0" "$DB_USER"
assert_eq "db apis cascaded" "0" "$DB_APIS"

TOTAL=$((PASS + FAIL))
echo ""
echo -e "${BOLD}────────────────────────────────────────${NC}"
echo -e "${BOLD}Results: ${GREEN}${PASS} passed${NC}${BOLD}, ${RED}${FAIL} failed${NC}${BOLD} / ${TOTAL} total${NC}"
echo -e "${BOLD}────────────────────────────────────────${NC}"

[[ "$FAIL" -eq 0 ]] 
