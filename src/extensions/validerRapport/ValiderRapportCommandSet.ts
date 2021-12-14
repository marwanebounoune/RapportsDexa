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
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ValiderRapportCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters) {
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    Libraryurl = this.context.pageContext.list.title;
        
    console.log("Libraryurl", Libraryurl);
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = event.selectedRows.length === 1 && (event.selectedRows[0].getValueByName("statut_rapport") === "Traité à valider" && (Libraryurl === "Grands Projets 2022" || Libraryurl === "Rapports 2022"));
    }
  }

  @override
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    let id_rapport:number = event.selectedRows[0].getValueByName("ID");
    console.log("rapport: ", event.selectedRows[0]);
    let FileRef = event.selectedRows[0].getValueByName("FileRef");
    
    userEmail = this.context.pageContext.user.email;
    var userId = await (await getUser(userEmail)).data.Id;
    
    const validateur: any = await sp.web.lists.getByTitle("l_validateurs").items.getAll();
    var query = function(element) {
      return element.membre_refId === userId;
    };
    const isValidateur = validateur.filter(query).length === 0? false: true;
    console.log("validateur", isValidateur);
    switch (event.itemId) {
      case 'COMMAND_1':
        const FileLeafRef = event.selectedRows[0].getValueByName("FileLeafRef");
        const confirmationDialog: ConfirmationDialog = new ConfirmationDialog();
        confirmationDialog.userEmail=userEmail;
        confirmationDialog.Libraryurl=Libraryurl;
        confirmationDialog.id_rapport=id_rapport;
        confirmationDialog.FileRef=FileRef;
        if(isValidateur)
          confirmationDialog.show();
        else
          Dialog.alert(`Vous n'êtes pas autorisé à effectuer cette action .`);
        break;
      default:
        throw new Error('Unknown command');
    }
  }


}
