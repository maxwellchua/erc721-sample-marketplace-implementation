"""
ASGI config for nft project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

import os

from dotenv import load_dotenv
from django.core.asgi import get_asgi_application

env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
load_dotenv(dotenv_path=env_path, verbose=True)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nft.settings')

application = get_asgi_application()
