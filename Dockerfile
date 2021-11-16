FROM python:3.8

RUN apt-get update && apt-get install -y --no-install-recommends \
  libpng-dev \
  libjpeg-dev \
  libfreetype6-dev \
  libpq-dev \
  libssl-dev \
  swig \
  graphviz \
  libgraphviz-dev \
  pkg-config

RUN mkdir /app

WORKDIR /app

COPY api /app/

RUN pip install poetry
# RUN python -m venv .venv && \
#   poetry export --dev -f requirements.txt --without-hashes | .venv/bin/pip install -r /dev/stdin
RUN poetry install --no-root

ENV DJANGO_SETTINGS_MODULE=nft.settings DJANGO_SECRET_KEY=COLLECTSTATIC DJANGO_ALLOWED_HOSTS=* DJANGO_CORS_ORIGIN_REGEX_WHITELIST=* \
    DJANGO_CSRF_TRUSTED_ORIGINS=*

RUN mkdir -p static && poetry run python manage.py collectstatic --noinput

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT [ "/docker-entrypoint.sh" ]
