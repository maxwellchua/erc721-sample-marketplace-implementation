# Celo NFT

| Site | URL |
| --- | --- |
| Staging    | Pending |
| Production | Pending |

# Web

## Setup

To install dependencies in all workspaces, execute:

```bash
yarn
```

Create a `.env` file in the root project directory using the provided `.env.example` as a template.

To run the web server, just execute:

```
yarn dev
```

# API

## Setup

To install dependencies, execute:

```bash
cd api/
poetry install
```

Create a `.env` file in the api directory using the provided `.env.example` as a template

Run a migrate

```bash
poetry run dotenv run ./manage.py migrate
```

To run the api server, just execute:

```bash
poetry run dotenv run ./manage.py runserver
```
