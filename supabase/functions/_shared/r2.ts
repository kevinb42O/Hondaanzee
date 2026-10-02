import { AwsClient } from 'npm:aws4fetch@1.0.20';
export function r2Client(){
 const accessKeyId=Deno.env.get('R2_ACCESS_KEY_ID'),secretAccessKey=Deno.env.get('R2_SECRET_ACCESS_KEY');
 if(!accessKeyId || !secretAccessKey)throw new Error('R2 is niet ingesteld.');
 return new AwsClient({accessKeyId,secretAccessKey,service:'s3',region:'auto',retries:0});
}
export function r2ObjectUrl(bucket:string,key:string){
 const endpoint=Deno.env.get('R2_S3_ENDPOINT');
 if(!endpoint?.endsWith('.eu.r2.cloudflarestorage.com') || !['hondaanzee-uploads','hondaanzee-media'].includes(bucket))throw new Error('Ongeldige R2-configuratie.');
 return `${endpoint}/${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
}
export function mediaBase(){return Deno.env.get('R2_PUBLIC_BASE_URL')==='https://media.hondaanzee.be'?'https://media.hondaanzee.be':null;}
