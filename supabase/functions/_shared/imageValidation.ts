export const MAX_UPLOAD_BYTES=2*1024*1024;
export const MAX_IMAGE_EDGE=1800;
export function checkWebpHeader(bytes:Uint8Array){
 if(bytes.length<30 || bytes.length>MAX_UPLOAD_BYTES)throw new Error('De upload moet kleiner zijn dan 2 MB.');
 const ascii=(start:number,end:number)=>new TextDecoder().decode(bytes.subarray(start,end));
 if(ascii(0,4)!=='RIFF'||ascii(8,12)!=='WEBP')throw new Error('De upload is geen geldige WebP-afbeelding.');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(view.getUint32(4,true)+8!==bytes.length)throw new Error('Het afbeeldingsbestand is onvolledig.');
 // The browser prepares a bounded static WebP. Reject animations before decode.
 if(ascii(12,16)==='VP8X' && (bytes[20]&2))throw new Error('Gebruik een stilstaande afbeelding.');
}
