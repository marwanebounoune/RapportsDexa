import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/folders";
const relativeDestinationUrl:string = "/sites/DEXA2022/"
export async function createFolder(nombreSousDossier:number, FolderPere:string, referenceDevis:string){
    const destinationUrl:string = FolderPere+"/"+referenceDevis;
    let folderName:string = null;
    try{
        const referenceFolderIsExist: boolean = await (await sp.web.getFolderByServerRelativePath(destinationUrl).get()).Exists;
        if(referenceFolderIsExist && FolderPere === "Grands Projets 2022") {
            for(let index=0; index<nombreSousDossier; index++){
                let folderName = relativeDestinationUrl+FolderPere+'/'+referenceDevis+'/'+referenceDevis+'-'+(index+1);
                await createForlder(folderName);
            }
        }
    }catch{
        if(FolderPere === "Grands Projets 2022") {
            folderName = relativeDestinationUrl+FolderPere+'/'+referenceDevis;
            await createForlder(folderName);
            for(let index=0; index<nombreSousDossier; index++){
                folderName = relativeDestinationUrl+FolderPere+'/'+referenceDevis+'/'+referenceDevis+'-R'+(index+1);
                await createForlder(folderName);
            }
        }
        if(FolderPere === "Rapports 2022") {
            if(nombreSousDossier === 1){
                folderName = relativeDestinationUrl+FolderPere+'/'+referenceDevis;
                await createForlder(folderName);
            }else{
                for(let index=0; index<nombreSousDossier; index++){
                    folderName = relativeDestinationUrl+FolderPere+'/'+referenceDevis+'-R'+(index+1);
                    await createForlder(folderName);
                }
            }
        }
    }
}

export async function createForlder(folderName:string){
    console.log("folderName", folderName);
    await sp.web.folders.add(folderName);
    const folder: any = await sp.web.getFolderByServerRelativePath(folderName).getItem();
    await folder.update({
        ContentTypeId: "0x012000BDA8146503B8384B8E52311DA81C7D6C"
    });
}

export  const generateCodeFacture = () => {
    const date = new Date();                    //yymmddhhmm
    let code: any = 22*Math.pow(10, 8);         //22=2022
    code += (date.getMonth()+1)*Math.pow(10, 6);//mois*10^6
    code += date.getDate()*Math.pow(10, 4);     //jour*10^4
    code += date.getHours()*Math.pow(10, 2);
    code += date.getMinutes();
    const finale_code = code*75937;
    return finale_code;
}

var one = [ "", "un ", "deux ", "trois ", "quatre ", "cinq ", "six ", "sept ", "huit ", "neuf ", "dix ", "onze ", "douze ",
  "treize ", "quatorze ", "quinze ", "seize ", "dix-sept ", "dix-huit ",
    "dix-neuf " ];

// Strings at index 0 and 1 are not used, they is to
// make array indexing simple
var ten = [ "", "", "vingt ", "trente ", "quarante",
"cinquante ", "soixante ", "soixante-dix ", "quatre-vingts ",
       "quatre-vingts-dix " ];

// n is 1- or 2-digit number
export function numToWords(n:number, s){
    var str = "";
    // if n is more than 19, divide it
    if (n > 19) {
        str += ten[(n/10)] + one[n % 10];
    }
    else {
        str += one[n];
    }

    // if n is non-zero
    if (n != 0) {
        str += s;
    }

    return str;
}

// Function to prvar a given number in words
export function convertToWords(n:number){
    // stores word representation of given number n
    var out = "";

    // handles digits at ten millions and hundred
    // millions places (if any)
    out += numToWords(n / 10000000,"milliards ");

    // handles digits at hundred thousands and one
    // millions places (if any)
    out += numToWords((n / 100000) % 100,"millions ");

    // handles digits at thousands and tens thousands
    // places (if any)
    out += numToWords(((n / 1000) % 100),"milles ");

    // handles digit at hundreds places (if any)
    out += numToWords(((n / 100) % 10),"cent ");

    if (n > 100 && n % 100 > 0) {
        out += "and ";
    }

    // handles digits at ones and tens places (if any)
    out += numToWords((n % 100), "");

    return out;
}
