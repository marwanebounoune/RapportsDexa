from django.shortcuts import render, redirect
from django.contrib import messages, auth
from django.contrib.auth import  logout
from .models import User
import re
import datetime
from django.contrib.auth.decorators import login_required
from django.utils.datastructures import MultiValueDictKeyError

# Create your views here.

@login_required(login_url='login')
def connexion(request):
    if request.method == 'GET':
        request.user.save()
        return render(request, 'accounts/home.html')
    
def login(request):
    if request.method == 'GET':
        return render(request, 'accounts/index.html')
    if request.method == 'POST':
        erreur=0
        username = request.POST['username']
        password = request.POST['password']
        user = auth.authenticate(username=username, password=password)
        user.save()
        if (user is not None):
            auth.login(request, user)
            return redirect('connexion')
        else:
            erreur=1
            messages.error(request, "Votre login ou mot de passe et incorrect.")
            return render(request, 'accounts/index.html', {'erreur':erreur})
    else:
        return render(request, 'accounts/index.html')

def logout_custumized(request):
    logout(request)
    return redirect('login')

@login_required(login_url='login')
def userChangerImage(request):
    if request.method == 'POST':
        #variable
        erreur = 0
        ImageProfile=''
        try:
            ImageProfile = request.FILES['ImageProfile']
        except MultiValueDictKeyError:
             messages.error(request, 'No image was selected')
        user = request.user
        if len(ImageProfile)!=0:
            if ImageProfile.size > 2000000:
                erreur = 1
                messages.error(request, "La taille du fichier ne doit pas depasser 2 Mo")
        if erreur == 0:
            user.photoProfile.delete()
            user.photoProfile.save(request.FILES['ImageProfile'].name, request.FILES['ImageProfile'])
            return redirect('connexion')
        else:
            return render(request, 'accounts/home.html',  {'erreur':erreur})

@login_required(login_url='login')
def updateUser(request):
    if request.method == 'POST':
        #Variable
        erreur = 0
        user_validation = User()
        #Récupération de la Data
        last_name = request.POST['last_name']
        first_name = request.POST['first_name']
        tel1 = request.POST['tel1']
        tel2 = request.POST['tel2']
        email = request.POST['email']
        key = request.POST['keyMap']
        #Vérification de la Data
        if len(last_name) == 0:
            erreur = 1
            messages.error(request, 'Merci de compléter le champs relatif au nom')
        elif len(last_name)>50:
            erreur = 1
            messages.error(request, 'Le champs relatif au nom ne doit pas dépasser 50 caractères')
        if len(first_name) == 0:
            erreur = 1
            messages.error(request, 'Merci de compléter le champs relatif au prenom')
        elif len(first_name)>50:
            erreur = 1
            messages.error(request, 'Le champs relatif au prenom ne doit pas dépasser 50 caractères')
        if len(tel1)!=0:
            if validateTelephone(tel1) == 0:
                erreur = 1
                messages.error(request, 'Numero de telephone 1 non valide (doit contenir 10 chiffre et commencer par 0)')
        if len(tel2)!=0:
            if validateTelephone(tel2) == 0:
                erreur = 1
                messages.error(request, 'Numero de telephone 2 non valide (doit contenir 10 chiffre et commencer par 0)')
        if len(email) == 0:
            erreur = 1
            messages.error(request, 'Merci de compléter le champs relatif au email')
        else:
            if validateEmail(email) == 0:
                erreur = 1
                messages.error(request, "Format de l'adresse e-mail non valide")
        if erreur == 0:
            #Modification des info personnelles de USER
            us = request.user
            us.last_name = last_name
            us.first_name = first_name
            us.tel1 = tel1
            us.tel2 = tel2
            us.email = email
            us.key_map = key
            us.save()
            #messages.success(request, 'Votre modification a été bien enregistrée.')
            return redirect('connexion')
        if erreur == 1:
            user_validation =User(last_name=last_name, first_name=first_name, tel1=tel1, tel2=tel2, email=email)
            context = {
                'user_validation': user_validation,
                'erreur':erreur
            }
            return render(request, 'accounts/home.html',context)
        

@login_required(login_url='login')
def updateSte(request):
    if request.method == 'POST':
        #Variable
        erreur = 0
        user_validation = User()
        #Récupération de la Data
        entreprise = request.POST['entreprise']
        ICE = request.POST['ICE']
        adresse = request.POST['adresse']
        domaine_activite = request.POST['domaine_activite']
        #Vérification de la Data
        if len(adresse) == 0:
            erreur = 1
            messages.error(request, 'Merci de compléter le champs relatif au nom complet')
        elif len(adresse)>50:
            erreur = 1
            messages.error(request, 'Le champs relatif au nom ne doit pas dépasser 50 caractères')
        if len(domaine_activite) == 0:
            erreur = 1
            messages.error(request, 'Merci de compléter le champs relatif au nom complet')
        elif len(domaine_activite)>50:
            erreur = 1
            messages.error(request, 'Le champs relatif au nom ne doit pas dépasser 50 caractères')
        if erreur == 0:
            #Modification des info personnelles de USER
            us = request.user
            us.ICE = ICE
            us.adresse = adresse
            us.entreprise = entreprise
            us.domaineActivite = domaine_activite
            us.save()
            subUsers = User.objects.filter(lien=request.user.id)
            for u in subUsers:
                u.ICE = ICE
                u.adresse = adresse
                u.entreprise = entreprise
                u.domaineActivite = domaine_activite
                u.save()
            #messages.success(request, 'Votre modification a été bien enregistrée.')
            return redirect('connexion')
        if erreur == 1:
            user_validation =User(adresse=adresse, domaineActivite=domaine_activite)
            context = {
                'user_validation': user_validation,
            }
            return render(request, 'accounts/home.html',context)

@login_required(login_url='login')
def userRemoveImage(request):
    request.user.photoProfile = ''
    request.user.save()
    return redirect('connexion')

@login_required(login_url='login')
def AjouterSousUser(request):
    if request.method == 'POST':
        #variable
        erreur = 0
        #get data from form
        firstName = request.POST['firstName']
        lastName = request.POST['lastName']
        email = request.POST['email']
        userName = request.POST['userName']
        password = request.POST['password']
        ConfirmPassword = request.POST['ConfirmPassword']
        permissions = request.POST['permission']
        if len(firstName) == 0:
            erreur=1
            messages.error(request, 'Merci de compléter le champs relatif au prenom')
        if len(lastName) == 0:
            erreur=1
            messages.error(request, 'Merci de compléter le champs relatif au nom')
        if len(email) != 0 and validateEmail(email) == 0:
            erreur = 1
            messages.error(request, "Format de l'adresse e-mail non valide")
        if len(userName) == 0:
            erreur=1
            messages.error(request, 'Merci de compléter le champs relatif au userName')
        elif User.objects.filter(username=userName).exists():
            erreur=1
            messages.error(request, "Ce nom d'utilisateur existe déjà." )
        if len(password) == 0:
            erreur=1
            messages.error(request, 'Merci de compléter le champs relatif au password')
        if len(ConfirmPassword) == 0:
            erreur=1
            messages.error(request, 'Merci de compléter le champs relatif au Confirmation password')
        elif password !=ConfirmPassword:
            erreur=1
            messages.error(request, 'Le champs password et la Confirmation sont pas identiques')
        if erreur == 0:
            subUser = User.objects.create_user(userName, email, password, 
            first_name= firstName, last_name= lastName,
            ICE=request.user.ICE, lien=request.user.id, userType='secondaire', 
            entreprise=request.user.entreprise, domaineActivite=request.user.domaineActivite,permission=permissions)
            subUser.save()
            return redirect('connexion')
        return render(request, 'accounts/home.html',  {'erreur':erreur})



def validateEmail(email):
    if len(email) > 6:
        if re.match(r'^[\w\.-]+@[\w\.-]+\.\w{2,4}$', email) != None:
            return 1
    return 0

def validateTelephone(tel):
    if re.match(r'^0[0-9]{9}$', tel) != None:
        return 1
    return 0