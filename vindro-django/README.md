# Fer's Guide to UV

uv python upgrade 3.12
uv python pin 3.12
uv add "django>6.0.0" --upgrade-package django
uv sync
uv run django-admin startproject vindrobackend .

# Django commands

docker exec -it vindro-backend uv run python src/manage.py createsuperuser
docker exec -it vindro-backend uv run python src/manage.py migrate tournament

# Seed the tournament
docker exec -it vindro-backend uv run python src/manage.py seed_tournament world-cup-2026