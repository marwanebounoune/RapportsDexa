from django.db import models
from django.core.validators import FileExtensionValidator
from Accounts.models import User

# Create your models here.
class Rapport(models.Model):
    lat = models.DecimalField(max_digits=20, decimal_places=18, null=True)
    lng = models.DecimalField(max_digits=20, decimal_places=18, null=True)
    client = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    affaire = models.CharField(max_length=50, null=True, blank=True)
    refernce = models.CharField(max_length=50, null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    tf = models.CharField(max_length=20, null=True, blank=True)
    fichier_pdf_genere = models.FileField(upload_to='RapportsPDF/%Y/%m/%d/',null=True, blank=True, validators=[FileExtensionValidator(allowed_extensions=['pdf'])])
    
