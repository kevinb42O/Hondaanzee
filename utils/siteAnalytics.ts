import { SUPABASE_URL } from './supabasePublicConfig.ts';
import { isMeasuredPath, referrerCategory } from '../supabase/functions/_shared/siteAnalytics.ts';
export function recordSiteEvent(path: string, event: 'pageview'|'website'|'route'|'telefoon'|'social') {
 if(typeof window==='undefined' || !['hondaanzee.be','www.hondaanzee.be'].includes(window.location.hostname) || !isMeasuredPath(path) || navigator.webdriver || navigator.doNotTrack==='1' || (navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl) return;
 const device=window.matchMedia('(max-width: 767px)').matches?'mobile':window.matchMedia('(max-width: 1023px)').matches?'tablet':'desktop';
 void fetch(`${SUPABASE_URL}/functions/v1/site-analytics`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path,event,device,referrer:referrerCategory(document.referrer)}),keepalive:true,credentials:'omit'}).catch(()=>{});
}
