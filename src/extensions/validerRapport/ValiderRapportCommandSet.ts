import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';

import ConfirmationDialog from './components/ConfirmationDialog';
import "@pnp/sp/folders";
import { getUser } from './utils';
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/folders";
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
let userEmail:string = null;
const LOG_SOURCE: string = 'ValiderRapportCommandSet';

export default class ValiderRapportCommandSet extends BaseListViewCommandSet<IValiderRapportCommandSetProperties> {

  @override
  public async onInit(): Promise<void> {
    //Log.info(LOG_SOURCE, 'Initialized ValiderRapportCommandSet');
    /* test test */

    const def = await sp.web.roleDefinitions.get();
    
    //console.log("def", def);
    // Gets the associated members group of a web
    /*const memberGroup = await sp.web.associatedMemberGroup();
    console.log("memberGroup", memberGroup);*/
    const groups = await sp.web.siteGroups.getByName("Aprés-Validation")();
    //console.log("groups", groups);
    const { Id: roleDefId } = await sp.web.roleDefinitions.getByName("Autorisation aprés validation rapport").get();
    
    //console.log("roleDefId", roleDefId);

    /* test test */
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters) {
    
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    const compareOneTwo: Command = this.tryGetCommand('COMMAND_2');
    const compareOneTree: Command = this.tryGetCommand('COMMAND_3');
    Libraryurl = this.context.pageContext.list.title;
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = event.selectedRows.length === 1 && ((event.selectedRows[0].getValueByName("statut_rapport") === "Traité à valider" || event.selectedRows[0].getValueByName("statut_rapport") === "Réclamation") && (Libraryurl === "Grands Projets 2022" || Libraryurl === "Rapports 2022"));
      compareOneTwo.visible = event.selectedRows.length === 1 && (event.selectedRows[0].getValueByName("statut_rapport") === "Validé à livrer" && (Libraryurl === "Grands Projets 2022" || Libraryurl === "Rapports 2022"));
      compareOneTree.visible = event.selectedRows.length === 1 && (event.selectedRows[0].getValueByName("statut_rapport") === "Livré" && (Libraryurl === "Grands Projets 2022" || Libraryurl === "Rapports 2022"));
    }
  }

  @override
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    let id_rapport:number = event.selectedRows[0].getValueByName("ID");
    //console.log("rapport: ", event.selectedRows[0]);
    let FileRef = event.selectedRows[0].getValueByName("FileRef");
    
    userEmail = this.context.pageContext.user.email;
    var userId = await (await getUser(userEmail)).data.Id;
    
    const validateur: any = await sp.web.lists.getByTitle("l_validateurs").items.getAll();
    var query = function(element) {
      return element.membre_refId === userId;
    };
    const isValidateur = validateur.filter(query).length === 0? false: true;
    const isLivreur = validateur.filter(query).length === 0? false: true;
    //console.log("validateur", isValidateur);
    const confirmationDialog: ConfirmationDialog = new ConfirmationDialog();
    switch (event.itemId) {
      case 'COMMAND_1':
        confirmationDialog.userEmail=userEmail;
        confirmationDialog.Libraryurl=Libraryurl;
        confirmationDialog.id_rapport=id_rapport;
        confirmationDialog.FileRef=FileRef;
        confirmationDialog.statut="Validé";
        if(isValidateur)
          confirmationDialog.show();
        else
          Dialog.alert(`Vous n'êtes pas autorisé à effectuer cette action.`);
        break;
      case 'COMMAND_2':
        confirmationDialog.userEmail=userEmail;
        confirmationDialog.Libraryurl=Libraryurl;
        confirmationDialog.id_rapport=id_rapport;
        confirmationDialog.FileRef=FileRef;
        confirmationDialog.statut="Livré";
        if(isLivreur)
          confirmationDialog.show();
        else
          Dialog.alert(`Vous n'êtes pas autorisé à effectuer cette action.`);
        break;
      case 'COMMAND_3':
        confirmationDialog.userEmail=userEmail;
        confirmationDialog.Libraryurl=Libraryurl;
        confirmationDialog.id_rapport=id_rapport;
        confirmationDialog.FileRef=FileRef;
        confirmationDialog.statut="Réclamation";
        if(isLivreur)
          confirmationDialog.show();
        else
          Dialog.alert(`Vous n'êtes pas autorisé à effectuer cette action.`);
        break;
      default:
        throw new Error('Unknown command');
    }
  }


}
