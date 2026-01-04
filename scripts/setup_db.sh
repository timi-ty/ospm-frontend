#!/bin/bash

# =============================================================================
# OSPM Local Database Setup Script
# =============================================================================
# This script is IDEMPOTENT - safe to run multiple times.
# It will:
#   1. Install PostgreSQL via Homebrew (if not installed)
#   2. Start PostgreSQL service (if not running)
#   3. Create the ospm_dev database (if not exists)
#   4. Create the ospm_user user with password (if not exists)
#   5. Grant privileges to ospm_user
#   6. Output the DATABASE_URL for .env.local
# =============================================================================

set -e

# Configuration
DB_NAME="ospm_dev"
DB_USER="ospm_user"
DB_PASS="ospm_pass"
DB_HOST="localhost"
DB_PORT="5432"

echo "🚀 OSPM Local Database Setup"
echo "============================"
echo ""

# -----------------------------------------------------------------------------
# Step 1: Check/Install PostgreSQL
# -----------------------------------------------------------------------------
echo "📦 Checking PostgreSQL installation..."

if command -v brew &> /dev/null; then
    if brew list postgresql@16 &> /dev/null || brew list postgresql@15 &> /dev/null || brew list postgresql &> /dev/null; then
        echo "   ✅ PostgreSQL is already installed via Homebrew"
    else
        echo "   📥 Installing PostgreSQL via Homebrew..."
        brew install postgresql@16
    fi
else
    echo "   ⚠️  Homebrew not found. Please install PostgreSQL manually."
    echo "   On macOS: brew install postgresql@16"
    echo "   On Ubuntu: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

# -----------------------------------------------------------------------------
# Set up PATH for PostgreSQL binaries (keg-only formula)
# -----------------------------------------------------------------------------
if [ -d "/opt/homebrew/opt/postgresql@16/bin" ]; then
    export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
elif [ -d "/opt/homebrew/opt/postgresql@15/bin" ]; then
    export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
elif [ -d "/usr/local/opt/postgresql@16/bin" ]; then
    export PATH="/usr/local/opt/postgresql@16/bin:$PATH"
elif [ -d "/usr/local/opt/postgresql@15/bin" ]; then
    export PATH="/usr/local/opt/postgresql@15/bin:$PATH"
fi

# Verify psql is available
if ! command -v psql &> /dev/null; then
    echo "   ⚠️  psql not found in PATH. Please add PostgreSQL to your PATH:"
    echo "   export PATH=\"/opt/homebrew/opt/postgresql@16/bin:\$PATH\""
    exit 1
fi

# -----------------------------------------------------------------------------
# Step 2: Start PostgreSQL service
# -----------------------------------------------------------------------------
echo ""
echo "🔧 Checking PostgreSQL service..."

# Try to find which version is installed
if brew list postgresql@16 &> /dev/null; then
    PG_SERVICE="postgresql@16"
elif brew list postgresql@15 &> /dev/null; then
    PG_SERVICE="postgresql@15"
else
    PG_SERVICE="postgresql"
fi

if brew services list | grep -q "$PG_SERVICE.*started"; then
    echo "   ✅ PostgreSQL service is already running"
else
    echo "   🔄 Starting PostgreSQL service..."
    brew services start $PG_SERVICE
    sleep 3
fi

# -----------------------------------------------------------------------------
# Step 3: Create database (if not exists)
# -----------------------------------------------------------------------------
echo ""
echo "🗄️  Checking database..."

if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "   ✅ Database '$DB_NAME' already exists"
else
    echo "   📝 Creating database '$DB_NAME'..."
    createdb "$DB_NAME" 2>/dev/null || true
    echo "   ✅ Database '$DB_NAME' created"
fi

# -----------------------------------------------------------------------------
# Step 4: Create user (if not exists)
# -----------------------------------------------------------------------------
echo ""
echo "👤 Checking database user..."

USER_EXISTS=$(psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" postgres 2>/dev/null || echo "")

if [ "$USER_EXISTS" = "1" ]; then
    echo "   ✅ User '$DB_USER' already exists"
    # Update password just in case
    psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" postgres > /dev/null 2>&1 || true
else
    echo "   📝 Creating user '$DB_USER'..."
    psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" postgres 2>/dev/null || true
    echo "   ✅ User '$DB_USER' created"
fi

# -----------------------------------------------------------------------------
# Step 5: Grant privileges
# -----------------------------------------------------------------------------
echo ""
echo "🔐 Setting up privileges..."

psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" postgres > /dev/null 2>&1 || true
psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;" postgres > /dev/null 2>&1 || true
# Also grant schema privileges for newer PostgreSQL versions
psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;" > /dev/null 2>&1 || true
psql -d $DB_NAME -c "ALTER SCHEMA public OWNER TO $DB_USER;" > /dev/null 2>&1 || true
echo "   ✅ Privileges granted"

# -----------------------------------------------------------------------------
# Step 6: Create .env.local file (takes precedence in Next.js)
# -----------------------------------------------------------------------------
echo ""
echo "📄 Setting up environment..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"

DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"

# Write to .env (Prisma reads this by default)
echo "DATABASE_URL=\"$DATABASE_URL\"" > "$ENV_FILE"
echo "   ✅ Created .env"

# -----------------------------------------------------------------------------
# Step 7: Push Prisma schema and seed database
# -----------------------------------------------------------------------------
echo ""
echo "🔄 Pushing Prisma schema..."
cd "$PROJECT_DIR"

# Export DATABASE_URL for Prisma CLI
export DATABASE_URL="$DATABASE_URL"

npx prisma db push --skip-generate
npx prisma generate

echo ""
echo "🌱 Seeding database..."
npm run db:seed

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
echo ""
echo "=============================================="
echo "✅ OSPM setup complete!"
echo "=============================================="
echo ""
echo "Run the development server:"
echo "  npm run dev"
echo ""
