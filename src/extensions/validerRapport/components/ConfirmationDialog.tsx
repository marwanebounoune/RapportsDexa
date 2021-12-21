import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import ConfirmationDialogContent from './ConfirmationDialogContent';
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/folders";
import { getUser } from '../utils';

export default class ConfirmationDialog extends BaseDialog {
    public message: string;
    public title: string;
    public userEmail:string;
    public id_rapport:number;
    public FileRef:string;
    public Libraryurl:string;
    public statut:string;

    public render(): void {
        ReactDOM.render(<ConfirmationDialogContent
        close={ this.close }
        title={ this.title }
        message={ this.message }
        submit={ this._submit }
        />, this.domElement);
    }
    
    public getConfig(): IDialogConfiguration {
        return {
        isBlocking: false
        };
    }
    
    protected onAfterClose(): void {
        super.onAfterClose();
        
        // Clean up the element for the next dialog
        ReactDOM.unmountComponentAtNode(this.domElement);
    }
    
    private _submit = async () => {
        this.close();
        if(this.statut=="Validé")
            await this.validerRapport(this.Libraryurl,this.userEmail, this.id_rapport, this.FileRef);
        else if(this.statut=="Livré"){
            await this.livrerRapport(this.Libraryurl,this.userEmail, this.id_rapport, this.FileRef);
        }
        else if(this.statut=="Réclamation"){
            await this.reclamationRapport(this.Libraryurl,this.userEmail, this.id_rapport, this.FileRef);
        }
    }

    private async validerRapport(Libraryurl:string, userEmail:string, id_rapport:number, folderRacine:string){
        //console.log("userId", await getUser(userEmail));
        var userId = await (await getUser(userEmail)).data.Id;
        //var date = new Date().toLocaleString("en-US", {timeZone: "Africa/Casablanca"});
        var _date = new Date().toISOString();
        //console.log("_date", _date);
        let itemAvantValid = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).get()
        //console.log("itemAvantValid => ", itemAvantValid)
        const groups = await sp.web.siteGroups();
        console.log("Groups => ", groups)
        const folder = sp.web.getFolderByServerRelativePath(folderRacine);////"+FileLeafRef);
        const folderItem = await folder.getItem();
        if(itemAvantValid.statut_rapport === "Traité à valider"){
            await folderItem.breakRoleInheritance(false);
            const { Id: roleDefId } = await sp.web.roleDefinitions.getByName("Gestion-après-validation").get();
            const { Id: roleDefI2 } = await sp.web.roleDefinitions.getByName("Collaboration").get();
            const groups = await sp.web.siteGroups.getByName("Gestion-après-validation")();
            const groups2 = await sp.web.siteGroups.getByName("Direction")();
            await folderItem.roleAssignments.add(groups.Id, roleDefId);
            await folderItem.roleAssignments.add(groups2.Id, roleDefI2);
        }
        else{
            const { Id: roleDefId3 } = await sp.web.roleDefinitions.getByName("Elaborateur_visiteur").get();
            const groups3 = await sp.web.siteGroups.getByName("Elaborateur_visiteur")();
            const { Id: roleDefId4 } = await sp.web.roleDefinitions.getByName("Gestion").get();
            const groups4 = await sp.web.siteGroups.getByName("Gestion")();
            const { Id: roleDefId5 } = await sp.web.roleDefinitions.getByName("Gestion-après-validation").get();
            const groups5 = await sp.web.siteGroups.getByName("Gestion-après-validation")();
            await folderItem.roleAssignments.remove(groups3.Id, roleDefId3);
            await folderItem.roleAssignments.remove(groups4.Id, roleDefId4);
            await folderItem.roleAssignments.add(groups5.Id, roleDefId5);
        }
        let item = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
          statut_rapport: "Validé à livrer",
          validateur_refId: userId,
          date_x0020_de_x0020_validation: _date
        });
    }

    private async livrerRapport(Libraryurl:string, userEmail:string, id_rapport:number, folderRacine:string){
        var userId = await (await getUser(userEmail)).data.Id;
        var _date = new Date().toISOString();
        let item2 = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).get()
        //console.log("item2 => ", item2)
        let item = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
          statut_rapport: "Livré",
          validateur_refId: userId,
          Date_x0020_de_x0020_livraison: _date
        });
        const folder = sp.web.getFolderByServerRelativePath(folderRacine);////"+FileLeafRef);
        const folderItem = await folder.getItem();
        //await folderItem.breakRoleInheritance(false);
        const { Id: roleDefId } = await sp.web.roleDefinitions.getByName("Gestion-après-validation").get();
        const groups = await sp.web.siteGroups.getByName("Gestion-après-validation")();
        await folderItem.roleAssignments.remove(groups.Id, roleDefId);
    }

    private async reclamationRapport(Libraryurl:string, userEmail:string, id_rapport:number, folderRacine:string){
        var userId = await (await getUser(userEmail)).data.Id;
        var _date = new Date().toISOString();
        let item2 = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).get()
        //console.log("item2 => ", item2);
        let item = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
          statut_rapport: "Réclamation",
          validateur_refId: userId,
          Date_x0020_de_x0020_reclamation: _date
        });
        const folder = sp.web.getFolderByServerRelativePath(folderRacine);////"+FileLeafRef);
        const folderItem = await folder.getItem();
        //await folderItem.breakRoleInheritance(false);
        const { Id: roleDefId } = await sp.web.roleDefinitions.getByName("Gestion").get();
        const groups = await sp.web.siteGroups.getByName("Gestion")();
        const { Id: roleDefId2 } = await sp.web.roleDefinitions.getByName("Elaborateur_visiteur").get();
        const groups2 = await sp.web.siteGroups.getByName("Elaborateur_visiteur")();
        await folderItem.roleAssignments.add(groups.Id, roleDefId);
        await folderItem.roleAssignments.add(groups2.Id, roleDefId2);
    }
}