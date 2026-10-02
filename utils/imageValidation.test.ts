import {describe,it,expect} from 'vitest';import {readFileSync} from 'node:fs';import {checkWebpHeader} from '../supabase/functions/_shared/imageValidation.ts';
describe('R2 image validation',()=>{
 it('accepts complete existing static WebP bytes',()=>expect(()=>checkWebpHeader(readFileSync('public/lakaian.webp'))).not.toThrow());
 it('rejects arbitrary files, oversized input and truncated images',()=>{
  for(const bytes of [new TextEncoder().encode('<svg>test</svg>'),new Uint8Array(3*1024*1024),readFileSync('public/lakaian.webp').subarray(0,100)])expect(()=>checkWebpHeader(bytes)).toThrow();
 });
});
