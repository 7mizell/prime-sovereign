#!/bin/bash
# Prime Sovereign Listings — Daily Outreach Cron
# Add to crontab: 0 9 * * * /path/to/prime-sovereign/daily-outreach.sh

set -e

PROJECT_DIR="/c/Users/Mjmiz/.openclaw/workspace/mizell-website/prime-sovereign"
LOG_DIR="$PROJECT_DIR/outreach"
DATE=$(date +%F)
LOG_FILE="$LOG_DIR/outreach-$DATE.log"

cd "$PROJECT_DIR"

# Load env vars
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Run outreach
echo "[$(date)] Starting daily outreach..." >> "$LOG_FILE"
node outreach-engine.js >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "[$(date)] Outreach completed successfully" >> "$LOG_FILE"
else
  echo "[$(date)] Outreach failed with exit code $EXIT_CODE" >> "$LOG_FILE"
fi

# Rotate logs older than 30 days
find "$LOG_DIR" -name "outreach-*.log" -mtime +30 -delete

echo "[$(date)] Daily outreach cron finished" >> "$LOG_FILE"