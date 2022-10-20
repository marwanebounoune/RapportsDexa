import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/folders";
const relativeDestinationUrl:string = "/sites/DEXA2022/";

export async function getUser(email: string) {
    let user = await sp.site.rootWeb.ensureUser(email);
    return user;
}
export  const generateCodeValidation = () => {
    const date = new Date();                    //yymmddhhmm
    let code: any = 22*Math.pow(10, 12);         //22=2022
    code += (date.getMonth()+1)*Math.pow(10, 10);//mois*10^6
    code += date.getDate()*Math.pow(10, 6);     //jour*10^4
    code += date.getHours()*Math.pow(10, 4);
    code += date.getMinutes()*Math.pow(10, 2);
    code += date.getSeconds();
    const finale_code = code*368689;
    return finale_code.toString(32);
}
export function isFalsy(variableValue:any){
    if(typeof variableValue!='undefined' && variableValue){
        //It will check undefined, null, 0 and "" also. 
        return false;
     }
     return true;
}
export const b64ToBlob = (base64: string, type: string = 'application/octet-stream'): Blob => {  
    const byteArray = Uint8Array.from(
      window.atob(base64.replace("data:image/png;base64,",""))  
        .split('')  
        .map((char) => char.charCodeAt(0)) 
    );  
    return new Blob([byteArray], { type });  
};  
