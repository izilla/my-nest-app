#!/bin/sh
set -e

if [ "$(psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='local_db_test';")" != "1" ]; then
  psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE local_db_test;"
fi

psql -U "$POSTGRES_USER" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE local_db_test TO dev_user;"
