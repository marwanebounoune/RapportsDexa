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
import { getUser, isFalsy } from './utils';
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
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters) {
    
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    const compareOneTwo: Command = this.tryGetCommand('COMMAND_2');
    const compareOneTree: Command = this.tryGetCommand('COMMAND_3');
    Libraryurl = this.context.pageContext.list.title;
    if (compareOneCommand) {
      compareOneCommand.visible = event.selectedRows.length !== 0 && ((event.selectedRows[0].getValueByName("statut_rapport") === "Traité à valider" || event.selectedRows[0].getValueByName("statut_rapport") === "Validé à livrer (Traitement)" || event.selectedRows[0].getValueByName("statut_rapport") === "Réclamation") && (Libraryurl === "Grands Projets 2022" || Libraryurl === "Rapports 2022"));
    }
    
    if (compareOneCommand) {
      compareOneTwo.visible = event.selectedRows.length !== 0 && (event.selectedRows[0].getValueByName("statut_rapport") === "Validé à livrer" && (Libraryurl === "Grands Projets 2022" || Libraryurl === "Rapports 2022"));
    }
    
    if (compareOneCommand) {
      compareOneTree.visible = event.selectedRows.length !== 0 && (event.selectedRows[0].getValueByName("statut_rapport") === "Livré" && (Libraryurl === "Grands Projets 2022" || Libraryurl === "Rapports 2022"));
    }
  }

  @override
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    let rapport:any = event.selectedRows[0];
    let rapports:any = event.selectedRows;
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
        confirmationDialog.rapports= rapports;
        confirmationDialog.statut="Validé";
        confirmationDialog.title= 'Êtes vous sûr de vouloir valider ce rapport?';
        if(isValidateur){
          if( isFalsy(rapport.getValueByName("Titre_x0020_foncier"))
            || isFalsy(rapport.getValueByName("Type_x0020_de_x0020_bien"))
            || isFalsy(rapport.getValueByName("trait_x00e9__x0020_par"))
            || isFalsy(rapport.getValueByName("Ville_x0020_client"))
            || isFalsy(rapport.getValueByName("visiteur_ref"))
            || isFalsy(rapport.getValueByName("Date_x0020_de_x0020_visite")) ){
              Dialog.alert(`Veuillez remplir les informations du rapport.`);
          }else{
            confirmationDialog.show();
          }
        }else{
          Dialog.alert(`Vous n'êtes pas autorisé à effectuer cette action.`);
        }
        break;
      case 'COMMAND_2':
        confirmationDialog.userEmail=userEmail;
        confirmationDialog.Libraryurl=Libraryurl;
        confirmationDialog.rapports= rapports;
        confirmationDialog.statut="Livré";
        confirmationDialog.title= 'Êtes vous sûr que ce rapport est livré?';
        if(isLivreur)
          confirmationDialog.show();
        else
          Dialog.alert(`Vous n'êtes pas autorisé à effectuer cette action.`);
        break;
      case 'COMMAND_3':
        confirmationDialog.userEmail=userEmail;
        confirmationDialog.Libraryurl=Libraryurl;
        confirmationDialog.rapports= rapports;
        confirmationDialog.statut="Réclamation";
        confirmationDialog.title= 'Êtes vous sûr de la réclamation de  ce rapport?';
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
