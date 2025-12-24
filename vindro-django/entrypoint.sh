#!/bin/bash

# Exit on error
set -e

echo "Running database migrations..."
uv run python src/manage.py migrate --noinput

echo "Starting Django development server..."
exec uv run python src/manage.py runserver 0.0.0.0:8000
