
export interface IEvaluationDialogContentProps {
    title: string;
    message: string;
    close: () => void;
    submit: (Lat:number, Lng:number, SurfPond:number, SurfTerr:number, SurfConstr:number, PrixEval:number) => void;
  }