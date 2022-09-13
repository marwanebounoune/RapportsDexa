
export interface IValidationDialogContentProps {
    title: string;
    Libraryurl: string;
    message: string;
    ID: number;
    close1: () => void;
    close2: () => void;
    submit1: (SurfPond:number, SurfTerr:number, SurfConstr:number, PrixEval:number, UpdateData:boolean) => void;
    submit2: (SurfPond:number, SurfTerr:number, SurfConstr:number, PrixEval:number, UpdateData:boolean) => void;
  }