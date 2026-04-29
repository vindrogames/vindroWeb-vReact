"""
URL configuration for vindrobackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from pathlib import Path
from django.contrib import admin
from django.urls import include, path
from django.http import HttpResponse, FileResponse
from accounts.views import public_profile, user_bracket_summary

def swagger_ui(request):
    html = """<!DOCTYPE html>
<html>
<head>
  <title>Vindro API Docs</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
  SwaggerUIBundle({
    url: "/api/docs/openapi.yaml",
    dom_id: '#swagger-ui',
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
    layout: "BaseLayout",
    deepLinking: true,
  })
</script>
</body>
</html>"""
    return HttpResponse(html)

def openapi_schema(request):
    schema_path = Path(__file__).parent / "openapi.yaml"
    return FileResponse(open(schema_path, "rb"), content_type="application/yaml")

urlpatterns = [
    path("api/auth/", include("accounts.urls")),
    path("api/users/<int:user_id>/", public_profile),
    path("api/users/<int:user_id>/brackets/", user_bracket_summary),
    path("api/highscores/", include("highscores.urls")),
    path("api/tournament/", include("tournament.urls")),
    path("accounts/", include("allauth.urls")),  # OAuth endpoints
    path("test/", include("test.urls")),
    path('admin/', admin.site.urls),
    path("api/docs/", swagger_ui),
    path("api/docs/openapi.yaml", openapi_schema),
]
