# Fer's Guide to UV

uv python upgrade 3.12
uv python pin 3.12
uv add "django>6.0.0" --upgrade-package django
uv sync
uv run django-admin startproject vindrobackend .