import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import ConfirmationDialogContent from './ConfirmationDialogContent';
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/folders";
import { generateCodeValidation, getUser } from '../utils';
import { Dialog } from '@microsoft/sp-dialog';

export default class ConfirmationDialog extends BaseDialog {
    public message: string;
    public title: string;
    public userEmail:string;
    public id_rapport:number;
    public FileRef:string;
    public Libraryurl:string;
    public statut:string;
    public rapports:any;

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
        //console.log("rapports 2 => ", this.rapports)
        let rapportsLength = this.rapports.length
        for(let i=0; i<rapportsLength; i++){
            let rapport:any = this.rapports[i];
            let id_rapport:number = rapport.getValueByName("ID");
            let FileRef = rapport.getValueByName("FileRef");
            // console.log("id_rapport -> ", id_rapport);
            // console.log("FileRef -> ", FileRef);
            // console.log("rapport -> ",rapport.getValueByName("statut_rapport"))
            if(this.statut=="Validé" && (rapport.getValueByName("statut_rapport")==="Traité à valider" || rapport.getValueByName("statut_rapport")==="Réclamation" || rapport.getValueByName("statut_rapport")==="Validé à livrer (Traitement)"))
                await this.validerRapport(this.Libraryurl,this.userEmail, id_rapport, FileRef);
            else if(this.statut=="Livré" && rapport.getValueByName("statut_rapport")==="Validé à livrer (Administration)"){
                await this.livrerRapport(this.Libraryurl,this.userEmail, id_rapport, FileRef);
            }
            else if(this.statut=="Réclamation" && rapport.getValueByName("statut_rapport")==="Livré"){
                await this.reclamationRapport(this.Libraryurl,this.userEmail, id_rapport, FileRef);
            }
            else if(this.statut=="Traité" && rapport.getValueByName("statut_rapport")==="Visité à traiter"){
                await this.aValiderRapport(this.Libraryurl,this.userEmail, id_rapport, FileRef);
            }
            else if(this.statut=="devalider" && rapport.getValueByName("statut_rapport")==="Validé à livrer (Administration)"){
                await this.devaliderRapport(this.Libraryurl, id_rapport, FileRef);
            }
        }
        if(this.statut=="Validé")
            Dialog.alert(`Les rapports sont validés avec succès.`);
        else if(this.statut=="Livré")
            Dialog.alert(`Les rapports sont livrés avec succès.`);
        else if(this.statut=="Réclamation")
            Dialog.alert(`Les rapports sont en réclamation avec succès.`);
        else if(this.statut=="Traité")
            Dialog.alert(`Le(s) rapport(s) est(sont) en validation avec succès.`);
        else if(this.statut=="devalider")
            Dialog.alert(`Le(s) rapport(s) est(sont) dévalider avec succès.`);
    }

    private async devaliderRapport(Libraryurl:string, id_rapport:number, folderRacine:string){
        const folder = sp.web.getFolderByServerRelativePath(folderRacine);
        const folderItem = await folder.getItem();
        await folderItem.resetRoleInheritance();
        await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
            statut_rapport: "Visité à traiter"
        });
    }

    private async validerRapport(Libraryurl:string, userEmail:string, id_rapport:number, folderRacine:string){
        var userId = await (await getUser(userEmail)).data.Id;
        const codeValidation = generateCodeValidation();
        //var date = new Date().toLocaleString("en-US", {timeZone: "Africa/Casablanca"});
        var _date = new Date().toISOString();
        let itemAvantValid = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).get()
        const folder = sp.web.getFolderByServerRelativePath(folderRacine);////"+FileLeafRef);
        const folderItem = await folder.getItem();
        if(itemAvantValid.statut_rapport === "Traité à valider"){
            await folderItem.breakRoleInheritance(false);
            const a = await sp.web.roleDefinitions.get()
            console.log("A", a)
            const { Id: roleDefId } = await sp.web.roleDefinitions.getByName("Gestion-après-validation").get();
            const { Id: roleDefI2 } = await sp.web.roleDefinitions.getByName("Collaboration").get();
            const groups = await sp.web.siteGroups.getByName("Gestion-après-validation")();
            const groups2 = await sp.web.siteGroups.getByName("Direction")();
            await folderItem.roleAssignments.add(groups.Id, roleDefId);
            await folderItem.roleAssignments.add(groups2.Id, roleDefI2);
            await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
              statut_rapport: "Validé à livrer (Administration)",
              validateur_refId: userId,
              date_x0020_de_x0020_validation: _date,
              code_rapport: codeValidation
            }).then(async (res)=>{
                const Res = await res.item.get()
                // console.log("res apres validation", Res)
                await sp.web.lists.getByTitle("EvalRapports").items.add({
                    Title:Res.Title,
                    Latitude_Longitude:Res.Latitude_Longitude,
                    Prix_x0020_total_x0020_de_x0020_:Res.Prix_x0020_total_x0020_de_x0020_la_x0020_r_x00e9_f_x00e9_rence,
                    Surface_x0020_terrain:Res.Surface_x0020_terrain,
                    Surface_x0020_pond_x00e9_r_x00e9_e:Res.Surface_x0020_pond_x00e9_r_x00e9_e,
                    Surface_x0020_construite:Res.Surface_x0020_construite
                })
            });
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
            let item = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
              statut_rapport: "Validé à livrer (Administration)",
            });
        }
    }

    private async livrerRapport(Libraryurl:string, userEmail:string, id_rapport:number, folderRacine:string){
        var userId = await (await getUser(userEmail)).data.Id;
        var _date = new Date().toISOString();
        //let item2 = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).get()
        //console.log("item2 => ", item2)
        await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
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

    private async aValiderRapport(Libraryurl:string, userEmail:string, id_rapport:number, folderRacine:string){
        var userId = await (await getUser(userEmail)).data.Id;
        await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
            statut_rapport: "Traité à valider",
            trait_x00e9__x0020_parId: userId,
        });
    }
}