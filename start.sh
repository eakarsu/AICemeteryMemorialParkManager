#!/bin/bash

# ============================================================
# Eternal Rest Memorial Park - Cemetery Management System
# Start Script with Auto-Reload
# ============================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "============================================================"
echo "  Eternal Rest Memorial Park - Cemetery Management System"
echo "============================================================"
echo ""

# ---- Colors ----
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# ---- Kill processes on ports ----
echo -e "${YELLOW}Cleaning up ports...${NC}"
for PORT in 3000 3001; do
  PID=$(lsof -ti :$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo -e "  Killing process on port $PORT (PID: $PID)"
    kill -9 $PID 2>/dev/null || true
    sleep 1
  fi
done
echo -e "${GREEN}✓ Ports cleared${NC}"

# ---- Check PostgreSQL ----
echo ""
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if ! pg_isready -q 2>/dev/null; then
  echo -e "${RED}PostgreSQL is not running. Starting it...${NC}"
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || {
    echo -e "${RED}Failed to start PostgreSQL. Please start it manually.${NC}"
    exit 1
  }
  sleep 2
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"

# ---- Create database if not exists ----
echo ""
echo -e "${YELLOW}Setting up database...${NC}"
if ! psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw cemetery_manager; then
  createdb cemetery_manager 2>/dev/null || echo "Database may already exist"
fi
echo -e "${GREEN}✓ Database ready${NC}"

# ---- Install dependencies ----
echo ""
echo -e "${YELLOW}Installing server dependencies...${NC}"
cd "$PROJECT_DIR/server"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Server dependencies installed${NC}"

echo ""
echo -e "${YELLOW}Installing client dependencies...${NC}"
cd "$PROJECT_DIR/client"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Client dependencies installed${NC}"

# ---- Seed database ----
echo ""
echo -e "${YELLOW}Seeding database with sample data...${NC}"
cd "$PROJECT_DIR/server"
node seeds/seed.js
echo -e "${GREEN}✓ Database seeded${NC}"

# ---- Start backend with nodemon (auto-reload) ----
echo ""
echo -e "${BLUE}Starting backend server on port 3001 (with auto-reload)...${NC}"
cd "$PROJECT_DIR/server"
npx nodemon index.js &
BACKEND_PID=$!
sleep 3

# ---- Start frontend with React dev server (auto-reload built-in) ----
echo ""
echo -e "${BLUE}Starting frontend on port 3000 (with hot-reload)...${NC}"
cd "$PROJECT_DIR/client"
BROWSER=none PORT=3000 npm start &
FRONTEND_PID=$!

# ---- Cleanup on exit ----
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  # Clean up any remaining processes on our ports
  for PORT in 3000 3001; do
    PID=$(lsof -ti :$PORT 2>/dev/null || true)
    if [ -n "$PID" ]; then
      kill -9 $PID 2>/dev/null || true
    fi
  done
  echo -e "${GREEN}✓ All services stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo "============================================================"
echo -e "${GREEN}  Application is starting!${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:3000"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:3001"
echo ""
echo -e "  ${YELLOW}Login:${NC}     admin@cemetery.com / admin123"
echo -e "           (or click 'Auto-Fill Login Credentials')"
echo ""
echo -e "  ${YELLOW}Auto-Reload:${NC} Both frontend and backend auto-reload on changes"
echo ""
echo "  Press Ctrl+C to stop all services"
echo "============================================================"

# Wait for background processes
wait
