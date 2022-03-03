from django.urls import path
from . import views


urlpatterns = [
    path('AjouterRapport', views.AjouterRapport, name='AjouterRapport'),
    path('filterRapport/<code>', views.filterRapport, name='filterRapport'),
    path('', views.GetRapport, name='GetRapport'),
]