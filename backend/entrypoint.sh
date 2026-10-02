#!/bin/sh
set -e

echo "Waiting for database at ${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432}..."
until python -c "
import os, sys
import psycopg
try:
    psycopg.connect(
        host=os.environ.get('POSTGRES_HOST', 'db'),
        port=os.environ.get('POSTGRES_PORT', '5432'),
        dbname=os.environ.get('POSTGRES_DB', 'event_analytics'),
        user=os.environ.get('POSTGRES_USER', 'event_user'),
        password=os.environ.get('POSTGRES_PASSWORD', 'event_pass'),
        connect_timeout=3,
    ).close()
except Exception as exc:
    print(exc)
    sys.exit(1)
"; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is up - running migrations"
python manage.py migrate --noinput

echo "Ensuring cache table exists"
python manage.py createcachetable || true

echo "Starting Gunicorn"
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers "${GUNICORN_WORKERS:-3}" \
    --access-logfile - \
    --error-logfile -
