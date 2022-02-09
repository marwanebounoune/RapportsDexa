from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields ='__all__'
        extra_kwargs = {"password": {'write_only': True}}
        def create(self, validated_data):
            """create and return a new user."""

            user = User(
                email = validated_data["email"],
                username = validated_data["username"],
                photoProfile = validated_data["photoProfile"],
                tel1 = validated_data["tel1"],
                tel2 = validated_data["tel2"],
                entreprise = validated_data["entreprise"],
                adresse = validated_data["adresse"],
                ICE = validated_data["ICE"],
                domaineActivite = validated_data["domaineActivite"]
            )
            user.set_password(validated_data["password"])
            user.save()
            return user