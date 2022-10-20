import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import DialogValidationContent from './DialogValidationContent';
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/folders";
import { generateCodeValidation, getUser } from '../utils';
import { Dialog } from '@microsoft/sp-dialog';
import Download from './Download';

export default class DialogValidation extends BaseDialog {
    public message: string;
    public title: string;
    public userEmail:string;
    public id_rapport:number;
    public FileRef:string;
    public Libraryurl:string;
    public statut:string;
    public rapports:any;
    public SurfPond:number;
    public SurfTerr:number;
    public SurfConstr:number;
    public PrixEval:number;
    public LatLng:string;
    public ID:number;
    ///////////////////////////////////////
    public itemUrl: string;  
    public base64Image: string;  
    public filename:string;
    public _input:any;

    public render(): void {
        ReactDOM.render(<DialogValidationContent
        close1={ this.close }
        close2={ this.close }
        title={ this.title }
        ID={ this.ID }
        Libraryurl={ this.Libraryurl }
        message={ this.message }
        submit1={ this._submit }
        submit2={ this._submit }
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
    
    private _submit = async (SurfPond, SurfTerr, SurfConstr, PrixEval, bool) => {
        this.close();
        console.log("rapports 2 => ", this.rapports)
        let rapportsLength = this.rapports.length
        console.log("rapportsLength", rapportsLength)
        for(let i=0; i<rapportsLength; i++){
            let rapport:any = this.rapports[i];
            let id_rapport:number = rapport.getValueByName("ID");
            let FileRef = rapport.getValueByName("FileRef");
            console.log("rapport.getValueByName(statut_rapport)", rapport.getValueByName("statut_rapport"))
            if(bool === false && this.statut=="Validé" && (rapport.getValueByName("statut_rapport")==="Traité à valider" || rapport.getValueByName("statut_rapport")==="Réclamation" || rapport.getValueByName("statut_rapport")==="Validé à livrer (Traitement)"))
                await this.validerRapport(this.Libraryurl,this.userEmail, id_rapport, FileRef);
            else if(bool === true && this.statut=="Validé" && (rapport.getValueByName("statut_rapport")==="Traité à valider" || rapport.getValueByName("statut_rapport")==="Réclamation" || rapport.getValueByName("statut_rapport")==="Validé à livrer (Traitement)"))
                await this.updaterAndValiderRapport(this.Libraryurl,this.userEmail, id_rapport, FileRef, SurfPond, SurfTerr, SurfConstr, PrixEval);
        }
        if(this.statut=="Validé")
            Dialog.alert(`Le(s) rapports est(sont) validés avec succès.`);
    }


    private async validerRapport(Libraryurl:string, userEmail:string, id_rapport:number, folderRacine:string){
        let itemAvantValid = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).get()
        var userId = await (await getUser(userEmail)).data.Id;
        const codeValidation = generateCodeValidation();
        // var date = new Date().toLocaleString("en-US", {timeZone: "Africa/Casablanca"});
        var _date = new Date().toISOString();
        var base64:any;
        console.log("this.itemUrl", this.itemUrl)
        await Download(this.base64Image, this.filename, "image/png", "/sites/DEXA2022/QR",base64)
        .then(async (res) =>{
            
            var url = this.itemUrl+"/"+this.filename+".docx"
            console.log("res111111111", res)
            console.log("url222222222", url)
            
            const file = await sp.web.getFolderByServerRelativePath(this.itemUrl).files.addUsingPath(this.filename+".docx", "content", {Overwrite: true});
            const item = await file.file.getItem();
            await item.update({
                TEST: "https://agroupma.sharepoint.com/"+res
            });
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
                    console.log("res apres validation", Res.Surface_x0020_pond_x00e9_r_x00e9_e)
                    const EvalRapports = await sp.web.lists.getByTitle("EvalRapports").items.getAll()
                    console.log("EvalRapports", EvalRapports)
                    await sp.web.lists.getByTitle("EvalRapports").items.add({
                        Title:Res.Title,
                        Latitude_Longitude:Res.Latitude_Longitude,
                        Prix_x0020_total_x0020_de_x0020_:Res.Prix_x0020_total_x0020_de_x0020_la_x0020_r_x00e9_f_x00e9_rence,
                        Surface_x0020_terrain:Res.Surface_x0020_terrain,
                        Surface_x0020_pond_x00e9_r_x00e9:Res.Surface_x0020_pond_x00e9_r_x00e9_e,
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
        }); 
    }
    private async updaterAndValiderRapport(Libraryurl:string, userEmail:string, id_rapport:number, folderRacine:string, SurfPond:number, SurfTerr:number, SurfConstr:number, PrixEval:number){
        var userId = await (await getUser(userEmail)).data.Id;
        const codeValidation = generateCodeValidation();
        // var date = new Date().toLocaleString("en-US", {timeZone: "Africa/Casablanca"});
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
              code_rapport: codeValidation,
              Surface_x0020_construite: SurfConstr,
              Surface_x0020_terrain: SurfTerr,
              Surface_x0020_pond_x00e9_r_x00e9_e: SurfPond,
              Prix_x0020_total_x0020_de_x0020_la_x0020_r_x00e9_f_x00e9_rence: PrixEval
            }).then(async (res)=>{
                const Res = await res.item.get()
                console.log("res apres validation", Res.Surface_x0020_pond_x00e9_r_x00e9_e)
                const EvalRapports = await sp.web.lists.getByTitle("EvalRapports").items.getAll()
                console.log("EvalRapports", EvalRapports)
                await sp.web.lists.getByTitle("EvalRapports").items.add({
                    Title:Res.Title,
                    Latitude_Longitude:Res.Latitude_Longitude,
                    Prix_x0020_total_x0020_de_x0020_:Res.Prix_x0020_total_x0020_de_x0020_la_x0020_r_x00e9_f_x00e9_rence,
                    Surface_x0020_terrain:Res.Surface_x0020_terrain,
                    Surface_x0020_pond_x00e9_r_x00e9:Res.Surface_x0020_pond_x00e9_r_x00e9_e,
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
}