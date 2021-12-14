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
        await this.validerRapport(this.Libraryurl,this.userEmail, this.id_rapport, this.FileRef);
    }

    private async validerRapport(Libraryurl:string, userEmail:string, id_rapport:number, folderRacine:string){
        
        console.log("userId", await getUser(userEmail));
        var userId = await (await getUser(userEmail)).data.Id;
        //var date = new Date().toLocaleString("en-US", {timeZone: "Africa/Casablanca"});
        var _date = new Date().toLocaleString();
        console.log("_date", _date);
        sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
            date_x0020_de_x0020_validation: _date
        }).then(async res=>{
            const itemlool = await res.item.get()
            console.log("date_x0020_de_x0020_validation", itemlool);
        })
        let item = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
          statut_rapport: "Validé à livrer",
          validateur_refId: userId,
          date_x0020_de_x0020_validation: _date
        });
        const folder = sp.web.getFolderByServerRelativePath(folderRacine);////"+FileLeafRef);
        const folderItem = await folder.getItem();
        await folderItem.breakRoleInheritance(false);
        const { Id: roleDefId } = await sp.web.roleDefinitions.getByName('Read').get();
        //id=5 for members
        await folderItem.roleAssignments.add(5, roleDefId);
        /*const roles = await folderItem.roleAssignments.get();
        console.log("folder roles", roles);
    
        const obj = await sp.web.firstUniqueAncestorSecurableObject.get();
        console.log("firstUniqueAncestorSecurableObject", obj);
        const perms2 = await sp.web.getCurrentUserEffectivePermissions();
        console.log("getCurrentUserEffectivePermissions", perms2);
        const groups = await sp.web.siteGroups();
        console.log("groups", groups);
        const def = await sp.web.roleDefinitions.get();
        
        console.log("def", def);*/
        // Gets the associated members group of a web
        const memberGroup = await sp.web.associatedMemberGroup();
        console.log("memberGroup", memberGroup);
      }
}