#!/bin/bash

cd /app

echo "Migrating DB..."
/app/.venv/bin/python manage.py migrate
echo "Compiling SCSS..."
/app/.venv/bin/python manage.py compilescss
echo "Collecting static files.."
/app/.venv/bin/python manage.py collectstatic --noinput --ignore=*.scss

echo "Running server..."
/app/.venv/bin/gunicorn --worker-class=uvicorn.workers.UvicornWorker nft.asgi:application -b=0.0.0.0:5000 --workers=10
