import requests  
from django.conf import settings  
from rest_framework.response import Response  
from rest_framework.decorators import api_view  

@api_view(['GET'])
def fetch_news(request):
    # Base URL for News API
    url = "https://newsapi.org/v2/top-headlines"
    # Define your parameters
    params = {
        'apiKey': settings.NEWS_API_KEY,
        'category': request.GET.get('category'),
        'q': request.GET.get('query'),
        'country': request.GET.get('country'),
    }
    # Make the request to the News API
    response = requests.get(url, params=params)
    # Return JSON data to the frontend
    return Response(response.json())