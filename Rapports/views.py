from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import Rapport
from django.conf import settings
from django.http.response import FileResponse, HttpResponseForbidden
import re
from Accounts.models import User
from Rapports.models import Rapport
import logging
from .serializers import RapportsSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view

# Create your views here.
@login_required(login_url='login')
def AjouterRapport(request):
    if request.method == 'POST':
        #variable
        erreur = 0
        rapport = Rapport()
        montant_HT = 0
        prix_par_region = 500
        prix_nbrUser = 500
        #get data from form
        regionChoisis = request.POST.getlist('regionChoisis')
        nbrUser = request.POST['nbrUser']
        if len(regionChoisis)==0 and int(nbrUser)==0:
            erreur = 1
            messages.error(request, 'Merci de sélectionner une des fonctionnalités au moins pour valider votre facturation')
        if erreur == 0:
            if len(regionChoisis) != 0:
                montant_HT += prix_par_region * len(regionChoisis)
            if len(nbrUser) != 0:
                montant_HT += prix_nbrUser * int(nbrUser)
            rapport = Rapport(client=request.user)
            rapport.save()
            return redirect('connexion')
        return render(request, 'rapports/rapports.html',  {'erreur':erreur})

@api_view(['GET'])
@login_required(login_url='login')
def GetRapport(request):
    if(request.user.id != 1):
        piece_jointes = Rapport.objects.filter(client_id=request.user.id)
    else:
        piece_jointes = Rapport.objects.all()
    serializer = RapportsSerializer(piece_jointes, many=True)
        
    context = {
        'data': serializer.data,
        'idUser': request.user.id
    }
    return render(request, 'rapports/rapports.html', context)

#proteger les fichiers pdf
@login_required(login_url='login')  
def serve_protected_document(request, relative_path):
    
    if re.match(r'^devis/+', relative_path) != None:
        if request.user.is_superuser or request.user.groups.filter(name='Front-office').exists():#frontend
            absolute_path = '{}/{}'.format(settings.MEDIA_ROOT, relative_path)
            response = FileResponse(open(absolute_path, 'rb'), as_attachment=True)
            return response
        else:
            return HttpResponseForbidden()
    else:
        if re.match(r'^doc_pins_my_map/+', relative_path) != None:
            doc = get_object_or_404(Rapport, fichier=relative_path)
            print("doc", doc)
            userPere = False
            Doc_owner = User.objects.get(id = doc.username.id)
            if(request.user.userType == 'secondaire'):
                userPere = User.objects.get(id = request.user.lien)
            if request.user == Doc_owner or ( userPere != False and Doc_owner == userPere ) or Doc_owner.lien == request.user.id:
                absolute_path = '{}/{}'.format(settings.MEDIA_ROOT, relative_path)
                response = FileResponse(open(absolute_path, 'rb'), as_attachment=True)
                return response
            else:
                return HttpResponseForbidden()
        else:
            absolute_path = '{}/{}'.format(settings.MEDIA_ROOT, relative_path)
            response = FileResponse(open(absolute_path, 'rb'), as_attachment=True)
            return response

