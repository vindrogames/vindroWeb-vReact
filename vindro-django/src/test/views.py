from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.

def index(request):
    data = {
        "message": "Hello from Django!",
        "status": "success",
        "data": {
            "users": 42,
            "active": True
        }
    }
    return JsonResponse(data)