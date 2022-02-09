from office365.runtime.auth.user_credential import UserCredential
from office365.sharepoint.client_context import ClientContext
site_url = "https://agroupma.sharepoint.com/sites/DEXA2022/"
sp_list = "Rapports 2022"
ctx = ClientContext(site_url).with_credentials(UserCredential("valactif.dev@agroup.ma", "P@$$agroup7"))
sp_lists = ctx.web.lists
s_list = sp_lists.get_by_title(sp_list)
l_items = s_list.get_items()
ctx.load(l_items)
ctx.execute_query()

for item in l_items:
    print(item.properties['Title'],item.properties['Check'])