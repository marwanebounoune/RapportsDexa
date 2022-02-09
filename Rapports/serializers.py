from Accounts.serializers import UserSerializer
from rest_framework import serializers
from .models import Rapport


#le serializer de la classe Document
class RapportsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rapport
        username = UserSerializer()
        fields = ('id', 'client', 'fichier_pdf_genere', 'lat', 'lng', 'affaire', 'date', 'tf', 'refernce')
        depth = 1