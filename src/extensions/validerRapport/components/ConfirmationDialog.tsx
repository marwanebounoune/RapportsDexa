import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import pnp from 'sp-pnp-js';
import ConfirmationDialogContent from './ConfirmationDialogContent';
import { Dialog } from '@microsoft/sp-dialog';

export default class ConfirmationDialog extends BaseDialog {
    public message: string;
    public Statut: string;
    public id_devis:number;
    
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
        console.log("Statut", this.Statut);
        const item = await pnp.sp.web.lists.getByTitle("Devis").items.getById(this.id_devis).get();
        console.log("item => ", item);
        if(item.Code_x0020_devis!=null && item.Code_x0020_devis!=""){
            pnp.sp.web.lists.getByTitle("Devis").items.getById(this.id_devis)
            .update({
                Statut : this.Statut
            }).then(res=>{
                console.log("RES => ", res);
                console.log("Statut 2 ", this.Statut);
            });
        }
        else{
            Dialog.alert(`Veuillez générer le code devis`);
        }
        this.close();
    }
    }