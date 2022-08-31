import * as React from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter, DialogContent } from 'office-ui-fabric-react/lib/Dialog';
import { IEvaluationDialogContentProps } from './IEvaluationDialogContentProps';

export default class EvaluationDialogContent extends React.Component<IEvaluationDialogContentProps> {

    public render(): JSX.Element {
        return <div>
            <DialogContent
                title={this.props.title}
                subText={this.props.message}
                onDismiss={this.props.close}
                showCloseButton={true}
            >
                <TextField label="Nombre des dossiers*" placeholder="Entrez le nombre des dossiers*" onChange={(e) => this.setState({nbr_dossier:parseInt((e.target as HTMLInputElement).value)}) }/>
                <DialogFooter>
                    <DefaultButton text='Non' title='Non' onClick={this.props.close} />
                    <PrimaryButton text='Oui' title='Oui' onClick={() => { this.props.submit();  }} />
                </DialogFooter>
            </DialogContent>
        </div>;
    }
}