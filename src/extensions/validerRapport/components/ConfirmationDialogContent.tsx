import * as React from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter, DialogContent } from 'office-ui-fabric-react/lib/Dialog';
import { IConfirmationDialogContentProps } from './IConfirmationDialogContentProps';

export default class ConfirmationDialogContent extends React.Component<IConfirmationDialogContentProps> {

    public render(): JSX.Element {
        return <div>
            <DialogContent
                title='Êtes vous sûr de vouloir valider ce rappart?'
                subText={this.props.message}
                onDismiss={this.props.close}
                showCloseButton={true}
            >
            <DialogFooter>
                <DefaultButton text='Non' title='Non' onClick={this.props.close} />
                <PrimaryButton text='Oui' title='Oui' onClick={() => { this.props.submit();  }} />
            </DialogFooter>
            </DialogContent>
        </div>;
    }
}