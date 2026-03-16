#!/bin/bash
# ─── Health Check Script ────────────────────────────────────
# Monitors application health and reports status
# Usage: ./scripts/healthcheck.sh [url] [interval]
set -euo pipefail

URL="${1:-http://localhost:3000/health}"
INTERVAL="${2:-5}"
MAX_RETRIES=3
RETRY_COUNT=0

echo "=========================================="
echo "  Health Monitor"
echo "  URL:      $URL"
echo "  Interval: ${INTERVAL}s"
echo "=========================================="
echo ""

check_health() {
  local response
  local http_code

  response=$(curl -s -w "\n%{http_code}" "$URL" 2>/dev/null)
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "200" ]; then
    RETRY_COUNT=0
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    status=$(echo "$body" | grep -o '"status":"[^"]*"' | head -1 || echo "unknown")
    uptime=$(echo "$body" | grep -o '"uptime":"[^"]*"' | head -1 || echo "unknown")
    echo "[$timestamp] ✅ HEALTHY | HTTP $http_code | $status | $uptime"
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] ❌ UNHEALTHY | HTTP $http_code | Retry $RETRY_COUNT/$MAX_RETRIES"

    if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
      echo ""
      echo "⚠️  ALERT: Service is DOWN after $MAX_RETRIES retries!"
      echo "   URL: $URL"
      echo "   Last HTTP Status: $http_code"
      # In production, you'd trigger an alert here (PagerDuty, Slack, etc.)
      RETRY_COUNT=0
    fi
  fi
}

# Run continuously
while true; do
  check_health
  sleep "$INTERVAL"
done
