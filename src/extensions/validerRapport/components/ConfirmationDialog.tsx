import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import ConfirmationDialogContent from './ConfirmationDialogContent';
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/folders";
import { getUser } from '../utils';

export default class ConfirmationDialog extends BaseDialog {
    public message: string;
    public userEmail:string;
    public id_rapport:number;
    public FileRef:string;
    public Libraryurl:string;
    public statut:string;

    public render(): void {
        ReactDOM.render(<ConfirmationDialogContent
        close={ this.close }
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
        else{
            if(this.statut=="Livré"){
                this.message='livré'
            await this.livrerRapport(this.Libraryurl,this.userEmail, this.id_rapport, this.FileRef);
            }
        }
    }

    private async validerRapport(Libraryurl:string, userEmail:string, id_rapport:number, folderRacine:string){
        
        //console.log("userId", await getUser(userEmail));
        var userId = await (await getUser(userEmail)).data.Id;
        //var date = new Date().toLocaleString("en-US", {timeZone: "Africa/Casablanca"});
        var _date = new Date().toISOString();
        console.log("_date", _date);
        let item = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
          statut_rapport: "Validé à livrer",
          validateur_refId: userId,
          date_x0020_de_x0020_validation: _date
        });
        const folder = sp.web.getFolderByServerRelativePath(folderRacine);////"+FileLeafRef);
        const folderItem = await folder.getItem();
        await folderItem.breakRoleInheritance(false);
        //const { Id: roleDefId } = await sp.web.roleDefinitions.getById(1073741928).get();
        
        const { Id: roleDefId } = await sp.web.roleDefinitions.getByName("Gestion").get();
        //console.log("Gestion", roleDefId);
        const { Id: roleDefI2 } = await sp.web.roleDefinitions.getByName("Collaboration").get();
        //console.log("Direction", roleDefI2);

        //id=5 for members
        const groups = await sp.web.siteGroups.getByName("Gestion")();
        const groups2 = await sp.web.siteGroups.getByName("Direction")();
        await folderItem.roleAssignments.add(groups.Id, roleDefId);
        await folderItem.roleAssignments.add(groups2.Id, roleDefI2);
        /*const roles = await folderItem.roleAssignments.get();
        console.log("folder roles", roles);
    
        const obj = await sp.web.firstUniqueAncestorSecurableObject.get();
        console.log("firstUniqueAncestorSecurableObject", obj);
        const perms2 = await sp.web.getCurrentUserEffectivePermissions();
        console.log("getCurrentUserEffectivePermissions", perms2);
        const groups = await sp.web.siteGroups();
        console.log("groups", groups);
        */
    }

    private async livrerRapport(Libraryurl:string, userEmail:string, id_rapport:number, folderRacine:string){
        var userId = await (await getUser(userEmail)).data.Id;
        var _date = new Date().toISOString();
        let item = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
          statut_rapport: "Livré",
          validateur_refId: userId,
          date_x0020_de_x0020_validation: _date
        });
        const folder = sp.web.getFolderByServerRelativePath(folderRacine);////"+FileLeafRef);
        const folderItem = await folder.getItem();
        //await folderItem.breakRoleInheritance(false);
        const { Id: roleDefId } = await sp.web.roleDefinitions.getByName("Gestion").get();
        const groups = await sp.web.siteGroups.getByName("Gestion")();
        await folderItem.roleAssignments.remove(groups.Id, roleDefId);
    }
}