declare interface IValiderRapportCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'ValiderRapportCommandSetStrings' {
  const strings: IValiderRapportCommandSetStrings;
  export = strings;
}
