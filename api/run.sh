#!/bin/bash

poetry install

echo "Getting into ENV in ${PWD}"
source "${PWD}"/.venv/bin/activate

echo "Getting servies up..."
docker-compose -f ../docker-compose.yaml up -d

echo "Running migrations ..."
poetry run dotenv run ./manage.py migrate

echo "Compiling SCSS..."
poetry run dotenv run ./manage.py compilescss
echo "Collecting static files.."
poetry run dotenv run ./manage.py collectstatic --noinput --ignore=*.scss

echo "Starting development server ..."
poetry run dotenv run ./manage.py runserver
