const{prepareAdminImport}=require('./prepare-admin-import.cjs');
const prepareZoneImport=zones=>{
 const rows=zones.map((content,index)=>({kind:'offleash',identity:index+1,content}));
 const payload=JSON.stringify(rows),{createHash}=require('node:crypto');
 const sha256=createHash('sha256').update(payload).digest('hex'),literal=`'${payload.replaceAll("'","''")}'`;
 // Original zones have no numeric id. Keep that complete object unchanged.
 const{sql:template}=prepareAdminImport([],[]);
 const sql=template.replace(/SHA-256 [a-f0-9]+/,`SHA-256 ${sha256}`).replaceAll(/haz_seed_[a-f0-9]+/g,`haz_seed_${sha256}`).replace("'[]'::jsonb",`${literal}::jsonb`).replace("(v_row->'content'->>'id')::bigint","(v_row->>'identity')::bigint");
 return{rows,sha256,sql};
};
if(require.main===module){const{OFF_LEASH_AREAS}=require('./place-data.cjs'),fs=require('node:fs');const result=prepareZoneImport(OFF_LEASH_AREAS),index=process.argv.indexOf('--output');if(index!==-1){const file=process.argv[index+1];if(!file||file.startsWith('--'))throw Error('Provide output filename');fs.writeFileSync(file,result.sql,{flag:'wx',mode:0o600});}console.log(JSON.stringify({zones:result.rows.length,sha256:result.sha256,written:index!==-1}));}
module.exports={prepareZoneImport};
