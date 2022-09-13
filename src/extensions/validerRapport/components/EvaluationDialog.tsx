import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import EvaluationDialogContent from './EvaluationDialogContent';
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/folders";
import { generateCodeValidation, getUser } from '../utils';
import { Dialog } from '@microsoft/sp-dialog';

export default class EvaluationDialog extends BaseDialog {
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

    public render(): void {
        ReactDOM.render(<EvaluationDialogContent
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
    
    private _submit = async (Lat, Lng, SurfPond, SurfTerr, SurfConstr, PrixEval) => {
        this.LatLng = Lat+","+Lng;
        this.close();
        console.log("rapports 2 => ", this.rapports)
        let rapportsLength = this.rapports.length
        console.log("rapportsLength", rapportsLength)
        for(let i=0; i<rapportsLength; i++){
            let rapport:any = this.rapports[i];
            let id_rapport:number = rapport.getValueByName("ID");
            let FileRef = rapport.getValueByName("FileRef");
            if(this.statut=="Traité" && rapport.getValueByName("statut_rapport")==="Visité à traiter")
                await this.aValiderRapport(this.Libraryurl,this.userEmail, id_rapport, SurfConstr, SurfTerr, SurfPond, PrixEval, this.LatLng);
        }
        if(this.statut=="Traité")
            Dialog.alert(`Le(s) rapport(s) est(sont) en validation avec succès.`);
    }

    private async aValiderRapport(Libraryurl:string, userEmail:string, id_rapport:number, SurfConstr:number, SurfTerr:number, SurfPond:number, PrixEval:number, LatLng:string){

        console.log(this.LatLng, this.SurfPond, this.SurfTerr, this.SurfConstr, this.PrixEval)
        var userId = await (await getUser(userEmail)).data.Id;
        const rapp = await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport)
        console.log("rapp", rapp)
        await sp.web.lists.getByTitle(Libraryurl).items.getById(id_rapport).update({
            statut_rapport: "Traité à valider",
            trait_x00e9__x0020_parId: userId,
            Latitude_Longitude: LatLng,
            Surface_x0020_construite: SurfConstr,
            Surface_x0020_terrain: SurfTerr,
            Surface_x0020_pond_x00e9_r_x00e9_e: SurfPond,
            Prix_x0020_total_x0020_de_x0020_la_x0020_r_x00e9_f_x00e9_rence: PrixEval
        });
    }
}