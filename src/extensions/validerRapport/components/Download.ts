//download.js v3.0, by dandavis; 2008-2014. [CCBY2] see http://danml.com/download.html for tests/usage  
// v1 landed a FF+Chrome compat way of downloading strings to local un-named files, upgraded to use a hidden frame and optional mime  
// v2 added named files via a[download], msSaveBlob, IE (10+) support, and window.URL support for larger+faster saves than dataURLs  
// v3 added dataURL and Blob Input, bind-toggle arity, and legacy dataURL fallback was improved with force-download mime and base64 support  
  
// data can be a string, Blob, File, or dataURL       

import { sp } from "@pnp/sp/presets/all";
import { b64ToBlob } from "../utils";

var navigator:any = Navigator                                              
export default async function download(data, strFileName, strMimeType, URL, base64) {
    //console.log("strFileName", strFileName)
    //console.log("data", data)
    //console.log("strMimeType", strMimeType)
    //console.log("URL", URL)
      
    var self = (window as any), // this script is only for browsers anyway...  
        u = "application/octet-stream", // this default mime also triggers iframe downloads  
        m = strMimeType || u,   
        x = data,  
        D = document,  
        a:any = D.createElement("a"),
        z = function(a){return String(a);},  
          
          
        B = self.Blob || self.MozBlob || self.WebKitBlob || z,  
        BB = self.MSBlobBuilder || self.WebKitBlobBuilder || self.BlobBuilder,  
        fn = strFileName+" QR.png" || "Code QR.png",  
        blob,   
        b,  
        ua,  
        fr;  
  
    //if(typeof B.bind === 'function' ){ B=B.bind(self); }  
      
    if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback  
        x=[x, m];  
        m=x[0];  
        x=x[1];   
    }      
    //go ahead and download dataURLs right away  
    if(String(x).match(/^data\:[\w+\-]+\/[\w+\-]+[,;]/)){  
        return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:  
            navigator.msSaveBlob(d2b(x), fn) :   
            saver(x) ; // everyone else can save dataURLs un-processed  
    }//end if dataURL passed?  
      
    try{  
      
        blob = x instanceof B ?   
            x :   
            new B([x], {type: m}) ;  
    }catch(y){  
        if(BB){  
            b = new BB();  
            b.append([x]);  
            blob = b.getBlob(m); // the blob  
        }     
    }   
    function d2b(u) { 
        //console.log("downloading 2 ...") 
        var p= u.split(/[:;,]/),  
        t= p[1],  
        dec= p[2] == "base64" ? atob : decodeURIComponent,  
        bin= dec(p.pop()),  
        mx= bin.length,  
        i= 0,  
        uia= new Uint8Array(mx);  
  
        for(i;i<mx;++i) uia[i]= bin.charCodeAt(i);  
  
        return new B([uia], {type: t});  
     }  
        
     
    async function saver(url, winMode = false){
        var urlQR:any;
        if ('download' in a) { //html5 A[download]            
            a.href = url;  
            a.setAttribute("download", fn);  
            a.innerHTML = "downloading...";  
            D.body.appendChild(a);
            //console.log("url ", url.replace("data:image/png;base64,",""))
            base64 = url;
            var myblob=  b64ToBlob(url); 
            //console.log("myblob", myblob)

            await sp.web.getFolderByServerRelativeUrl(URL)
            .files.add(fn, myblob as Blob, true)
            .then((data2) =>{
                //console.log("myblob ", myblob)
                //console.log("fn fn", fn)
                //console.log("Blob", Blob)
                //console.log("data 2", data2.data.ServerRelativeUrl)
                urlQR= data2.data.ServerRelativeUrl;
            })
            .catch((error) =>{
                //console.log("error", error)
                alert("Error: Veuillez supprimer l'ancien QR qui existe dans le dossier"+strFileName);
            });
            /*setTimeout(function() {  
                a.click();  
                D.body.removeChild(a);  
                if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(a.href);}, 250 );}  
            }, 66); */ 
            return urlQR;  
        }
        //do iframe dataURL download (old ch+FF):  
        var f = D.createElement("iframe");  
        D.body.appendChild(f);  
        if(!winMode){ // force a mime that will download:  
            url="data:"+url.replace(/^data:([\w\/\-\+]+)/, u);
        }
        f.src = url;  
        setTimeout(function(){ D.body.removeChild(f); }, 333);
    }//end saver

    if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)  
        return navigator.msSaveBlob(blob, fn);  
    }     
    if(self.URL){ // simple fast and modern way using Blob and URL:  
        saver(self.URL.createObjectURL(blob), true);  
    }else{  
        // handle non-Blob()+non-URL browsers:  
        if(typeof blob === "string" || blob.constructor===z ){  
            try{  
                return saver( "data:" +  m   + ";base64,"  +  self.btoa(blob)  );   
            }catch(y){  
                return saver( "data:" +  m   + "," + encodeURIComponent(blob)  );   
            }  
        }  
        // Blob but not URL:  
        fr=new FileReader();  
        fr.onload=function(e){  
            saver(this.result);   
        };  
        fr.readAsDataURL(blob);  
    }
    return true;  


} /* end download() */  