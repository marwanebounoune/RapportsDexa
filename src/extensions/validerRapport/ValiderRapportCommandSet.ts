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
import EvaluationDialog from './components/EvaluationDialog';
import ValidationDialog from './components/ValidationDialog';
import "@pnp/sp/folders";
import { generateCodeValidation, getUser, isFalsy } from './utils';
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
    const compareOneFour: Command = this.tryGetCommand('COMMAND_4');
    const compareOneFive: Command = this.tryGetCommand('COMMAND_5');
    Libraryurl = this.context.pageContext.list.title;
    // console.log("Libraryurl", Libraryurl)
    if (compareOneCommand) {
      compareOneCommand.visible = event.selectedRows.length !== 0 && ((event.selectedRows[0].getValueByName("statut_rapport") === "Traité à valider" || event.selectedRows[0].getValueByName("statut_rapport") === "Validé à livrer (Traitement)" || event.selectedRows[0].getValueByName("statut_rapport") === "Réclamation") && (Libraryurl === "Grands Projets 2022" || Libraryurl === "Rapports 2022"));
    }
    if (compareOneTwo) {
      compareOneTwo.visible = event.selectedRows.length === 1 && (event.selectedRows[0].getValueByName("statut_rapport") === "Validé à livrer (Administration)" && (Libraryurl === "Grands Projets 2022" || Libraryurl === "Rapports 2022"));
    }
    if (compareOneTree) {
      compareOneTree.visible = event.selectedRows.length === 1 && (event.selectedRows[0].getValueByName("statut_rapport") === "Livré" && (Libraryurl === "Grands Projets 2022" || Libraryurl === "Rapports 2022"));
    }
    if (compareOneFour) {
      compareOneFour.visible = event.selectedRows.length === 1 && (event.selectedRows[0].getValueByName("statut_rapport") === "Visité à traiter" && (Libraryurl === "Grands Projets 2022" || Libraryurl === "Rapports 2022"));
    }
    if (compareOneFive) {
      compareOneFive.visible = event.selectedRows.length === 1 && (event.selectedRows[0].getValueByName("statut_rapport") === "Validé à livrer (Administration)" && (Libraryurl === "Grands Projets 2022" || Libraryurl === "Rapports 2022"));
    }
  }

  @override
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    let rapport:any = event.selectedRows[0];
    let rapports:any = event.selectedRows;
    userEmail = this.context.pageContext.user.email;
    var userId = await (await getUser(userEmail)).data.Id;
    var isValidateur:any =false;
    var isDevalidateur:any =false;
    var isLivreur;
    //const Conventions: any = await sp.web.lists.getByTitle("Rapports 2022").items.getAll();
    //console.log("Conventions -> ", Conventions)
    //const codeValidation = generateCodeValidation();
    //console.log("finale_code:  ", codeValidation)
    //console.log("validateur", isValidateur);
    const confirmationDialog: ConfirmationDialog = new ConfirmationDialog();
    const evaluationDialog: EvaluationDialog = new EvaluationDialog();
    const validationDialog: ValidationDialog = new ValidationDialog();


    switch (event.itemId) {
      case 'COMMAND_1':
        var query = function(element) {
          return element.membre_refId === userId;
        };
        await sp.web.lists.getByTitle("l_validateurs").items.getAll().then((res) => {
          isValidateur = res.filter(query).length === 0? false: true;
          isLivreur = res.filter(query).length === 0? false: true;
        }).catch(() => {
          isValidateur = false;
          isLivreur = false;
        });
        validationDialog.userEmail=userEmail;
        validationDialog.Libraryurl=Libraryurl;
        validationDialog.rapports= rapports;
        let FileLeafRef = rapport.getValueByName("FileLeafRef");
        let SurfConstr = "";
        let SurfTerr = "";
        let SurfPond = "";
        let PrixEval = "";
        validationDialog.statut="Validé";
        const ID = rapport.getValueByName("ID");
        await sp.web.lists.getByTitle(Libraryurl).items.getById(ID).get().then(res =>{
          SurfPond = res["Surface_x0020_pond_x00e9_r_x00e9_e"]
          SurfConstr = res["Surface_x0020_construite"]
          SurfTerr = res["Surface_x0020_terrain"]
          PrixEval = res["Prix_x0020_total_x0020_de_x0020_la_x0020_r_x00e9_f_x00e9_rence"]
        });
        validationDialog.Libraryurl = Libraryurl;
        validationDialog.ID = ID
        validationDialog.title= "Êtes vous sûr de vouloir valider "+FileLeafRef+" avec une SP de "+SurfPond+" m2, SC de "+SurfConstr+" m2, ST de "+SurfTerr+" m2 et un montant d'evaluation de "+PrixEval+" Dhs?";
        if(isValidateur){
          if( (isFalsy(rapport.getValueByName("Titre_x0020_foncier"))
            || isFalsy(rapport.getValueByName("Type_x0020_de_x0020_bien"))
            || isFalsy(rapport.getValueByName("trait_x00e9__x0020_par"))
            || isFalsy(rapport.getValueByName("Ville_x0020_client"))
            || isFalsy(rapport.getValueByName("visiteur_ref"))
            || isFalsy(rapport.getValueByName("Date_x0020_de_x0020_visite"))) 
            && Libraryurl!= "Grands Projets 2022"){
              Dialog.alert(`Veuillez remplir les informations du rapport.`);
          }
          else{
            validationDialog.show();
          }
        }
        else{
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
      case 'COMMAND_4':
        evaluationDialog.userEmail=userEmail;
        evaluationDialog.Libraryurl=Libraryurl;
        evaluationDialog.rapports= rapports;
        evaluationDialog.statut="Traité";
        evaluationDialog.title= 'Êtes vous sûr à demander la validation de ce rapport?';
        let id_rapport:number = rapport.getValueByName("ID");
        // console.log("Rapport ", id_rapport)
        let item2 = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).get()
        // console.log("item2 => ", item2);
        if(item2.R_x00e9_f_x00e9_rence_x0020_DevisId != null 
          && item2.Titre_x0020_foncier != null 
          && item2.Type_x0020_de_x0020_bien != null 
          && item2.Ville_x0020_clientId != null 
          && item2.visiteur_refId != null
          && item2.Date_x0020_de_x0020_visite != null
        ){
          evaluationDialog.show();
        }
        else{
          Dialog.alert(`Veuillez remplir les informations du rapport.`);
        }
        break;
      case 'COMMAND_5':
        var queryDevalidateur = function(element) {
          return element.D_x00e9_validateurId === userId;
        };
        await sp.web.lists.getByTitle("l_devalidateurs").items.getAll().then((res) => {
          isDevalidateur = res.filter(queryDevalidateur).length === 0? false: true;;
        }).catch(() => {
          isDevalidateur = false;
        });
        confirmationDialog.Libraryurl=Libraryurl;
        confirmationDialog.rapports= rapports;
        confirmationDialog.statut="devalider";
        confirmationDialog.title= 'Êtes vous sûr de devalider ce rapport?';
        if(isDevalidateur)
          confirmationDialog.show();
        else
          Dialog.alert(`Vous n'êtes pas autorisé à effectuer cette action.`);
        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
