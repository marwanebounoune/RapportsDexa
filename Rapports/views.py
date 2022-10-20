import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
import requests
from .models import Rapport
from django.conf import settings
from django.http.response import FileResponse, HttpResponseForbidden
import re
from Accounts.models import User
from Rapports.models import Rapport
import logging
from .serializers import RapportsSerializer
from rest_framework.decorators import api_view
from django.shortcuts import render
from django.utils.translation import gettext_lazy as _
# import cdata.sharepoint as mod
from office365.runtime.auth.user_credential import UserCredential
from office365.sharepoint.client_context import ClientContext
from office365.runtime.auth.authentication_context import AuthenticationContext
from office365.runtime.client_request import ClientRequest
import json
###################################


VIEW_ERRORS = {
    404: {'title': _("404 - Page not found"),
          'content': _("Rapport inexistant."), },
    500: {'title': _("Internal error"),
          'content': _("A 500 Internal error means..."), },
    403: {'title': _("Permission denied"),
          'content': _("A 403 Forbidden error means ..."), },
    400: {'title': _("Bad request"),
          'content': _("A 400 Bad request error means ..."), }, }
def error_view_handler(request, exception, status):
    return render(request, template_name='partials/errors.html', status=status,
        context={'error': exception, 'status': status,
            'title': VIEW_ERRORS[status]['title'],
            'content': VIEW_ERRORS[status]['content']})

def error_404_view_handler(request, exception=None):
    return error_view_handler(request, exception, 404)

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

# @api_view(['GET'])
# @login_required(login_url='login')
def GetRapport(request):
    site_url = "https://valactifcom.sharepoint.com/sites/SGMB/"
    sp_list = "Rapports"
    ctx = ClientContext(site_url).with_credentials(UserCredential("bounoune.marwane@valactif.com", "N3w4dm!n?$_#16-07"))
    sp_lists = ctx.web.lists
    s_list = sp_lists.get_by_title(sp_list)
    l_items = s_list.get_items()
    ctx.load(l_items)
    print("*******************************0*******************************")
    ctx.execute_query()
    ateliers = []
    i = 0
    for item in l_items:
        print("*******************************1*******************************")
        print(item.properties)
        ateliers.append(item.properties)
        i+=1
    print("*******************************2*******************************")
    print("ateliers", ateliers)
    print("Length", len(ateliers))
    print(ateliers[0])
    for i in len(ateliers):
        print("*******************************3*******************************")
        print("ateliers", i, ateliers[i])


    #########################################################################################################################

    # site_url = "https://valactifcom.sharepoint.com/sites/DEXA2022/"
    # sp_list = "l_credits"
    # ctx = ClientContext(site_url).with_credentials(UserCredential("bounoune.marwane@valactif.com", "N3w4dm!n?$_#16-07"))
    # sp_lists = ctx.web.lists
    # s_list = sp_lists.get_by_title(sp_list)
    # l_items = s_list.get_items()
    # ctx.load(l_items)
    # # ctx.execute_query()
    # for item in l_items:
    #     print("Hello")

    #########################################################################################################################

    # client_id = '02e11639-3b9a-4e45-a782-abae595c7f1e'
    # client_secret = 'pwWdVs+IX6T0qRq5fCkhVKGOSa+rgU81qvL0UzP3doE='
    # tenant =  'valactifcom' # e.g. https://tenant.sharepoint.com
    # tenant_id = '51279ebb-f37c-43bf-8da4-0d829ffc8613'  
    # client_id = client_id + '@' + tenant_id
    # data = {
    #     'grant_type':'client_credentials',
    #     'resource': "00000003-0000-0ff1-ce00-000000000000/" + tenant + ".sharepoint.com@" + tenant_id, 
    #     'client_id': client_id,
    #     'client_secret': client_secret,
    # }
    # headers = {
    #     'Content-Type':'application/x-www-form-urlencoded'
    # }
    # url = "https://accounts.accesscontrol.windows.net/51279ebb-f37c-43bf-8da4-0d829ffc8613/tokens/OAuth/2"
    # r = requests.post(url, data=data, headers=headers)
    # json_data = json.loads(r.text)
    # print(json_data)
    # headers = {
    #     'Authorization': "Bearer " + json_data['access_token'],
    #     'Accept':'application/json;odata=verbose',
    #     'Content-Type': 'application/json;odata=verbose'
    # }
    # url = "https://valactifcom.sharepoint.com/sites/DEXA2022/_api/web/lists/getbytitle('l_credits')/items"
    # l = requests.get(url, headers=headers)
    # print("l.text", l.text)

    #########################################################################################################################

    # site_url = "https://valactifcom.sharepoint.com/sites/DEXA2022"
    # ctx = ClientContext(site_url).with_credentials(UserCredential("bounoune.marwane@valactif.com", "N3w4dm!n?$_#16-07"))
    # print("1")
    # web = ctx.web.lists
    # print("2")
    # ctx.load(web)
    # print("3")
    # ctx.execute_query()
    # print("Web title: {0}".format(web.properties))

    #########################################################################################################################

    # cred = HttpNtlmAuth('bounoune.marwane@valactif.com', 'N3w4dm!n?$_#16-07')
    # site = Site('https://valactifcom.sharepoint.com/sites/DEXA2022', auth=cred)
    # sp_list = site.List('list name')
    # list_data = sp_list.GetListItems()
    # print("list_data", list_data)

    #########################################################################################################################

    # site_url = 'https://valactifcom.sharepoint.com/sites/SGMB'
    # app_principal = {
    #     'client_id': '02e11639-3b9a-4e45-a782-abae595c7f1e',
    #     'client_secret': 'pwWdVs+IX6T0qRq5fCkhVKGOSa+rgU81qvL0UzP3doE=',
    # }
    # print("En attente")
    # context_auth = AuthenticationContext(url=site_url)
    # print("En attente1")
    # # if context_auth.acquire_token_for_app(client_id=app_principal['client_id'], client_secret=app_principal['client_secret']):
    # if context_auth.acquire_token_for_user("bounoune.marwane@valactif.com", "N3w4dm!n?$_#16-07"):
    #     print("En attente2")    
    #     ctx = ClientContext(site_url, context_auth)
    #     print("En attente3")
    #     web = ctx.web.lists
    #     print("En attente4")
    #     ctx.load(web)
    #     ctx.execute_query()
    #     print("Web site title: {0}".format(web.properties['Title']))
    # else:
    #     print("Fin")

    #########################################################################################################################

    # site_url = "https://valactifcom.sharepoint.com/sites/DEXA2022"
    # ctx = ClientContext(site_url).with_credentials(UserCredential("bounoune.marwane@valactif.com", "N3w4dm!n?$_#16-07"))
    # # Create header for the http request
    # my_headers = {
    #     'accept' : 'application/json;odata=verbose',
    #     'content-type' : 'application/json;odata=verbose',
    #     'odata' : 'verbose',
    #     'X-RequestForceAuthentication' : 'true'
    # }
    # if not hasattr(ctx, 'cookie'):
    #     print("authentication failed!"); quit()
    # else:
    # # This will return a Requests response object. See the requests documentation for details. s.get() returns Requests response object
    #     r = ctx.getfile(site_url,filename = 'DASHBOARD.xlsx')
    #     print (r.status_code)
    # print (r.raw)
    # print("Script Complete")

    #########################################################################################################################

    if(request.user.id != 1):
        piece_jointes = Rapport.objects.filter(client_id=request.user.id)
    else:
        piece_jointes = Rapport.objects.all()
    piece_jointes = Rapport.objects.all()
    serializer = RapportsSerializer(piece_jointes, many=True)
    context = {
        'data': serializer.data,
        'idUser': request.user.id
    }
    return render(request, 'rapports/rapport.html', context)

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


@api_view(['GET'])
def filterRapport(request, code):
    
    if (Rapport.objects.filter(code_rapport=code).exists() == True):
        rapport = Rapport.objects.filter(code_rapport=code)
        print("Rapport -> ", rapport)
        
        serializer = RapportsSerializer(rapport, many=True)
            
        context = {
            'rapport': rapport
        }
        print("context -> ", context)
        return render(request, 'rapports/rapport.html', context)
    else:
        return error_404_view_handler(request)

