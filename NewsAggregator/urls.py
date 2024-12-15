from django.contrib import admin
from django.urls import path, include  # include is used to include app-level URLs

urlpatterns = [
    path('admin/', admin.site.urls),  # Default Django admin URL
    path('api/news/', include('news.urls')),  # Include the news app URLs
]