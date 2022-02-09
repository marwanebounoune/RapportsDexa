from django.urls import path
from . import views


urlpatterns = [
    path('AjouterRapport', views.AjouterRapport, name='AjouterRapport'),
    path('', views.GetRapport, name='GetRapport'),
]