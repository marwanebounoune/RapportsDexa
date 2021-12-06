import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'ValiderRapportCommandSetStrings';
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/folders";
import pnp from 'sp-pnp-js';
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IValiderRapportCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}
let Libraryurl:string = null;
const LOG_SOURCE: string = 'ValiderRapportCommandSet';

export default class ValiderRapportCommandSet extends BaseListViewCommandSet<IValiderRapportCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ValiderRapportCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    Libraryurl = this.context.pageContext.list.title;
    console.log("Libraryurl", Libraryurl);
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = event.selectedRows.length === 1 && event.selectedRows[0].getValueByName("statut_rapport") != "Validé à livré";
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    let id_rapport:number = event.selectedRows[0].getValueByName("ID");
    let ItemChildCount:number = event.selectedRows[0].getValueByName("ItemChildCount");
    console.log("rapport: ", event.selectedRows[0]);
    let FileRef = event.selectedRows[0].getValueByName("FileRef");
    let folderRacine = FileRef.split('/sites/DEXA2022/Grands Projets 2022/')[1];// xx
    let folderRacineName = folderRacine.split('/')[0];
    console.log("folder Racine", folderRacine);
    console.log("folder Racine Name", folderRacineName);
    let taux = event.selectedRows[0].getValueByName("Taux_x0020_de_x0020_validation");
    console.log("taux", taux.toFixed(0));
    switch (event.itemId) {
      case 'COMMAND_1':
        Dialog.alert(`${this.properties.sampleTextOne}`);
        const FileLeafRef = event.selectedRows[0].getValueByName("FileLeafRef");
        this.validerRapport(id_rapport, folderRacine, folderRacineName);
        break;
      default:
        throw new Error('Unknown command');
    }
  }
  private async getUser(email: string) {
    let user = await sp.site.rootWeb.ensureUser(email);
    return user;
  }
  private async validerRapport(id_rapport:number, folderRacine:string, folderRacineName:string ){
    let items = await sp.web.lists.getByTitle("Rapports 2022").items.getAll();
    var userEmail = this.context.pageContext.user.email;
    console.log("userId", await this.getUser(userEmail));
    var userId = await (await this.getUser(userEmail)).data.Id;
    let item = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
      statut_rapport: "Validé à livré",
      validateur_refId: userId,
      date_x0020_de_x0020_validation: new Date().toLocaleString("fr-MA", {timeZone: "Africa/Casablanca"})
    });
    const folder = sp.web.getFolderByServerRelativePath("Grands Projets 2022/"+folderRacine);////"+FileLeafRef);
    const folderItem = await folder.getItem();
    await folderItem.breakRoleInheritance(false);
    const { Id: roleDefId } = await sp.web.roleDefinitions.getByName('Read').get();
    //id=5 for members
    await folderItem.roleAssignments.add(5, roleDefId);
    const roles = await folderItem.roleAssignments.get();
    console.log("folder roles", roles);
    //let _item:any = await folderItem.get();
    const _folderRacine:any = await sp.web.getFolderByServerRelativePath("Grands Projets 2022/"+folderRacineName);
    
    let all_folders:any = await _folderRacine.folders.get();
    let count:any = all_folders.length;
    console.log("count", count);
    const _folderRacineItem:any = await _folderRacine.getItem();
    let _item:any = await _folderRacineItem.get();
    console.log("_item => ",_item)
    console.log("Taux_x0020_de_x0020_validation", await _item.Taux_x0020_de_x0020_validation);
    let Taux_de_validation = await _item.Taux_x0020_de_x0020_validation;
    let ItemChildCount = await _item.FolderChildCount;
    console.log("ItemChildCount", ItemChildCount);
    let new_taux = Taux_de_validation+1/count;
    console.log("new taux", new_taux);
    let statut_de_traitement = null;
    if(new_taux===0){
      statut_de_traitement = "Non commencé";
    }
    if(new_taux>0){
      statut_de_traitement = "En cours";
    }
    if(new_taux===1){
      statut_de_traitement = "Traité";
    }
    await _folderRacineItem.update({
      Taux_x0020_de_x0020_validation: new_taux,
      Statut_x0020_de_x0020_Traitement: statut_de_traitement
    });
    const obj = await sp.web.firstUniqueAncestorSecurableObject.get();
    console.log("firstUniqueAncestorSecurableObject", obj);
    const perms2 = await sp.web.getCurrentUserEffectivePermissions();
    console.log("getCurrentUserEffectivePermissions", perms2);
    const groups = await sp.web.siteGroups();
    console.log("groups", groups);
    const def = await sp.web.roleDefinitions.get();
    
    console.log("def", def);
    // Gets the associated members group of a web
    const memberGroup = await sp.web.associatedMemberGroup();
    console.log("memberGroup", memberGroup);
  }
}
