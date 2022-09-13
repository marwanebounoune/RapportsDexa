import * as React from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter, DialogContent } from 'office-ui-fabric-react/lib/Dialog';
import { IEvaluationDialogContentProps } from './IEvaluationDialogContentProps';
import { TextField, InputAdornment } from '@material-ui/core';
import {Dropdown, IDropdownOption, Dialog, IDropdownStyles, DialogType} from 'office-ui-fabric-react';

var dialogContentProps = {
    type: DialogType.normal,
    title: 'Alert',
    subText: 'Veuillez spécifier les informations demandées!',
};
const modelProps = {
    isBlocking: false,
    styles: { main: { maxWidth: 450 } },
  };
export default class EvaluationDialogContent extends React.Component<IEvaluationDialogContentProps, {Lat:number, Lng:number, SurfPond:number, SurfTerr:number, SurfConstr:number, PrixEval:number, alert:boolean}> {

    constructor(props) {
        super(props);
        this.state={
            alert:false,
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
            {this.state.alert ? 
                <Dialog 
                    hidden={!this.state.alert} 
                    onDismiss={()=> this.setState({alert:false})} 
                    dialogContentProps={dialogContentProps}
                    modalProps={modelProps}
                >
                    <DialogFooter>
                    <DefaultButton onClick={()=>this.setState({alert:false})} text="Cancel" />
                    </DialogFooter>
                </Dialog>
            :<></>}
            <DialogContent
                title={this.props.title}
                subText={this.props.message}
                onDismiss={this.props.close}
                showCloseButton={true}
            >
                <TextField inputProps={{min: 0, style: { textAlign: 'center'}}} label="Latitude*" placeholder="Entrez la Latitude*" onChange={(e) => this.setState({Lat:parseFloat((e.target as HTMLInputElement).value)}) }/>
                <TextField inputProps={{min: 0, style: { textAlign: 'center'}}} label="Longitude*" placeholder="Entrez la Longitude*" onChange={(e) => this.setState({Lng:parseFloat((e.target as HTMLInputElement).value)}) }/>
                <br/><br/>
                <TextField 
                    inputProps={{min: 0, style: { textAlign: 'center'}}}
                    variant="filled" 
                    size="small" 
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
                    label="Prix total de l'évaluation*" 
                    placeholder="Entrez le prix total de l'évaluation*" 
                    onChange={(e) => this.setState({PrixEval:parseInt((e.target as HTMLInputElement).value)}) } 
                    InputProps={{startAdornment: <InputAdornment position="start">Dhs</InputAdornment>}}
                />
                <br/><br/>
                <p>NB: Ne laissez aucun champ vide (ex: Si le bien est Résidentiel veuillez saisir </p><p> la surface pondérée et 0 pour les autres champs).</p>
                <DialogFooter>
                    <DefaultButton text='Non' title='Non' onClick={this.props.close} />
                    <PrimaryButton text='Oui' title='Oui' onClick={() => { this.check_and_submit_data();  }} />
                </DialogFooter>
            </DialogContent>
        </div>;
    }
    private check_and_submit_data(){
        if (
            isNaN(this.state.Lat)
            || isNaN(this.state.Lng)
            || isNaN(this.state.SurfPond)
            || isNaN(this.state.SurfTerr)
            || isNaN(this.state.SurfConstr)
            || isNaN(this.state.PrixEval)
            ){
            this.setState({alert:true})
        }
        else{
            this.props.submit(this.state.Lat, this.state.Lng, this.state.SurfPond, this.state.SurfTerr, this.state.SurfConstr, this.state.PrixEval);
        }

    }
}