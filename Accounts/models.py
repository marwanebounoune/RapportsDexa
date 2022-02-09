from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import FileExtensionValidator

DOMAINE_CHOICES = (
    ('Autre', 'Autre'),
    ('SG_AM', 'Société de gestion / Asset management'),
    ('B_L', 'Banque / Leasing'),
    ('P_D', 'Promoteur / Développeur'),
    ('TI','Transaction en immobilier'),
    ('C_EI','Conseil / Expertise en immobilier')
)

TypeUser_CHOICES = (
    ('principal', 'principal'),
    ('secondaire', 'secondaire')
)

class User(AbstractUser):
    photoProfile = models.FileField(upload_to='images/profiles/',null=True, blank=True, validators=[FileExtensionValidator(allowed_extensions=['png','jpeg','jpg','tiff'])])
    tel1 = models.CharField(max_length=10, null=True, blank=True)
    tel2 = models.CharField(max_length=10, null=True, blank=True)
    entreprise = models.CharField(max_length=20, null=True, blank=True)
    adresse = models.CharField(max_length=500, null=True, blank=True)
    ICE = models.CharField(max_length=15, null=True, blank=True)
    domaineActivite = models.CharField(max_length=25, null=True, blank=True, choices=DOMAINE_CHOICES)
    userType = models.CharField(max_length=100, choices=TypeUser_CHOICES, default="principal")
    pass

