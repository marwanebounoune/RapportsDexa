import * as React from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter, DialogContent } from 'office-ui-fabric-react/lib/Dialog';
import { IValidationDialogContentProps } from './IValidationDialogContentProps';
import { TextField, InputAdornment } from '@material-ui/core';
import {Dropdown, IDropdownOption, Dialog, IDropdownStyles, DialogType} from 'office-ui-fabric-react';
import { sp } from "@pnp/sp/presets/all";


var dialogContentProps = {
    type: DialogType.normal,
    title: 'Alert',
    subText: 'Veuillez Spécifier les informations demandées!',
};
const modelProps = {
    isBlocking: false,
    styles: { main: { maxWidth: 450 } },
};
export default class ValidationDialogContent extends React.Component<IValidationDialogContentProps, {Lat:number, Lng:number, SurfPond:number, SurfTerr:number, SurfConstr:number, PrixEval:number, alertVide:boolean, alertValidation:boolean, alertUpdate:boolean}> {

    constructor(props) {
        super(props);
        this.state={
            alertVide:false,
            alertValidation:true,
            alertUpdate:false,
            SurfPond:0,
            SurfTerr:0,
            SurfConstr:0,
            PrixEval:0,
            Lat:0,
            Lng:0
        }
    }
    public render(): JSX.Element {
        return <div>
            {this.state.alertVide ? 
                <Dialog 
                    hidden={!this.state.alertVide} 
                    onDismiss={()=> this.setState({alertVide:false})} 
                    dialogContentProps={dialogContentProps}
                    modalProps={modelProps}
                >
                    <DialogFooter>
                    <DefaultButton onClick={()=>this.setState({alertVide:false})} text="Cancel" />
                    </DialogFooter>
                </Dialog>
            :<></>}
            {this.state.alertValidation ? 
                <DialogContent
                    title={this.props.title}
                    subText={this.props.message}
                    onDismiss={this.props.close1}
                    showCloseButton={true}
                >
                    <DialogFooter>
                        <DefaultButton text='Non' title='Non' onClick={this.props.close1} />
                        <PrimaryButton text='Modifier' title='Modifier' onClick={() => { this.get_data_for_update();  }} />
                        <PrimaryButton text='Oui' title='Oui' onClick={() => {  this.save_data() }} />
                    </DialogFooter>
                </DialogContent>
            :<></>}
            {this.state.alertUpdate ? 
                <DialogContent
                    title={"Veuillez modifier les champs non valide."}
                    subText={this.props.message}
                    onDismiss={this.props.close2}
                    showCloseButton={true}
                >
                    <TextField 
                        inputProps={{min: 0, style: { textAlign: 'center'}}}
                        variant="filled" 
                        size="small" 
                        value={this.state.SurfPond} 
                        label="surface pondérée*" 
                        placeholder="Entrez la surface pondérée*" 
                        onChange={(e) => this.setState({SurfPond:parseInt((e.target as HTMLInputElement).value)}) } 
                        InputProps={{startAdornment: <InputAdornment position="start">m2</InputAdornment>}}
                    />
                    <br/><br/>
                    <TextField 
                        inputProps={{min: 0, style: { textAlign: 'center'}}}
                        variant="filled" 
                        size="small" 
                        value={this.state.SurfTerr} 
                        label="surface terrain*" 
                        placeholder="Entrez la surface terrain*" 
                        onChange={(e) => this.setState({SurfTerr:parseInt((e.target as HTMLInputElement).value)}) } 
                        InputProps={{startAdornment: <InputAdornment position="start">m2</InputAdornment>}}
                    />
                    <br/><br/>
                    <TextField 
                        inputProps={{min: 0, style: { textAlign: 'center'}}}
                        variant="filled" 
                        size="small" 
                        value={this.state.SurfConstr} 
                        label="surface construite*" 
                        placeholder="Entrez la surface construite*" 
                        onChange={(e) => this.setState({SurfConstr:parseInt((e.target as HTMLInputElement).value)}) } 
                        InputProps={{startAdornment: <InputAdornment position="start">m2</InputAdornment>}}
                    />
                    <br/><br/>
                    <TextField 
                        inputProps={{min: 0, style: { textAlign: 'center'}}}
                        variant="filled" 
                        size="small" 
                        value={this.state.PrixEval} 
                        label="Prix total de l'évaluation*" 
                        placeholder="Entrez le prix total de l'évaluation*" 
                        onChange={(e) => this.setState({PrixEval:parseInt((e.target as HTMLInputElement).value)}) } 
                        InputProps={{startAdornment: <InputAdornment position="start">Dhs</InputAdornment>}}
                    />
                    <br/><br/>
                    <p>NB: Veuillez sélectionner le champ à modifier.</p>
                    <DialogFooter>
                        <DefaultButton text='Non' title='Non' onClick={this.props.close2} />
                        <PrimaryButton text='Update' title='Update' onClick={() => { this.update_data() }} />
                    </DialogFooter>
                </DialogContent> 
            :<></>}
        </div>;
    }
    private async get_data_for_update(){
        this.setState({alertValidation:false})
        this.setState({alertUpdate:true})
        await sp.web.lists.getByTitle(this.props.Libraryurl).items.getById(this.props.ID).get().then(res =>{
            this.setState({SurfPond : res["Surface_x0020_pond_x00e9_r_x00e9_e"]})
            this.setState({SurfConstr : res["Surface_x0020_construite"]})
            this.setState({SurfTerr : res["Surface_x0020_terrain"]})
            this.setState({PrixEval : res["Prix_x0020_total_x0020_de_x0020_la_x0020_r_x00e9_f_x00e9_rence"]})
        });
    }
    private update_data(){
        this.props.submit2(this.state.SurfPond, this.state.SurfTerr, this.state.SurfConstr, this.state.PrixEval, true);
    }
    private save_data(){
        this.props.submit1(this.state.SurfPond, this.state.SurfTerr, this.state.SurfConstr, this.state.PrixEval, false);
    }
}
