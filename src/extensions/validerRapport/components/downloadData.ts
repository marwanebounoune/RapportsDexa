var navigator:any = Navigator
export default function downloadData (content, filename, type = 'text/csv;charset=utf-8;') {
    const blob = new Blob([content], { type })
    // IE11 & Edge
    if (navigator.msSaveBlob) { // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
     navigator.msSaveBlob(blob, filename)
    } else {
     // In FF link must be added to DOM to be clicked
     const link = document.createElement('a')
     link.href = window.URL.createObjectURL(blob)
     link.setAttribute('download', filename)
     document.body.appendChild(link)
     link.click() // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
     document.body.removeChild(link)
    }
   }