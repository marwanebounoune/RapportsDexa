from django.contrib import admin
from .models import User
from django.contrib.auth.admin import UserAdmin as origin

# Register your models here.
class UserAdmin(origin):
    #les champs à afficher sur la page de liste des utilisateurs pour modification de l’interface d’administration
    list_display =  ('id', 'username', 'tel1','tel2','ICE','adresse','domaineActivite')
    #définir les champs qui seront affichés sur la page de création d'utilisateur.
    add_fieldsets = origin.add_fieldsets + ((None, {'fields': ('tel1','tel2','ICE','adresse','domaineActivite')}),)
