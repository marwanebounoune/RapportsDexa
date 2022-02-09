from django.urls import path
from . import views


urlpatterns = [

    path('singIn', views.login, name='login'),
    path('logout/', views.logout_custumized, name='logout'),
    path('', views.connexion, name='connexion'),
    path('userChangerImage', views.userChangerImage, name='userChangerImage'),
    path('updateUser/', views.updateUser, name='updateUser'),
    path('updateSte/', views.updateSte, name='updateSte'),
    path('userRemoveImage/', views.userRemoveImage, name='userRemoveImage'),
    path('AjouterSousUser', views.AjouterSousUser, name='AjouterSousUser'),
]