
export interface IConfirmationDialogContentProps {
    title: string;
    message: string;
    close: () => void;
    submit: () => void;
  }