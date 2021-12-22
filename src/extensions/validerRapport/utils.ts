import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/folders";
const relativeDestinationUrl:string = "/sites/DEXA2022/";

export async function getUser(email: string) {
    let user = await sp.site.rootWeb.ensureUser(email);
    return user;
}
export  const generateCodeValidation = () => {
    const date = new Date();                    //yymmddhhmm
    let code: any = 22*Math.pow(10, 8);         //22=2022
    code += (date.getMonth()+1)*Math.pow(10, 6);//mois*10^6
    code += date.getDate()*Math.pow(10, 4);     //jour*10^4
    code += date.getHours()*Math.pow(10, 2);
    code += date.getMinutes();
    const finale_code = code*76977;
    return finale_code;
}