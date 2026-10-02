import React, { useEffect } from 'react';
import { Loader2, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMember } from '../components/member/MemberProvider.tsx';
import AccountWelcome from '../components/member/AccountWelcome.tsx';
import MemberDashboard from '../components/member/MemberDashboard.tsx';
import { safeMemberReturnPath } from '../utils/memberData.ts';
import { useSEO } from '../utils/seo.ts';

export default function Account() {
  const member = useMember(), [params] = useSearchParams(), navigate = useNavigate();
  useSEO({ title: 'Mijn Hond aan Zee | Jouw favoriete plekjes en uitstapjes', description: 'Bewaar je favoriete plekken, plan een uitstap en volg jouw kustgemeenten met een gratis Hond aan Zee-account.', canonical: 'https://hondaanzee.be/account', noindex: true });
  const next = safeMemberReturnPath(params.get('next'));
  useEffect(() => {
    if (member.data && !member.loading && !member.error && member.data.profile.status === 'active' && next !== '/account') navigate(next, { replace: true });
  }, [member.data, member.loading, member.error, next, navigate]);
  if (member.sessionLoading || (member.session && member.loading && !member.data)) return <div className="member-loading" role="status"><Loader2 className="animate-spin" size={30} /><p>We leggen jouw stukje kust klaar…</p></div>;
  if (!member.session) return <AccountWelcome />;
  if (member.error || !member.data) return <div className="member-status-page"><RefreshCw size={35} /><h1>Even geen verbinding met je kust.</h1><p>{member.error || 'Je account wordt klaargezet.'}</p><button className="member-button member-button-primary" onClick={() => void member.refresh()}>Probeer opnieuw</button><button className="member-text-button" onClick={() => void member.signOut().catch(e => member.notify(e.message))}>Uitloggen</button></div>;
  if (member.data.profile.status === 'suspended') return <div className="member-status-page"><ShieldCheck size={35} /><h1>Je account is tijdelijk geschorst.</h1><p>Neem contact op met info@hondaanzee.be als je hier vragen over hebt.</p><button className="member-button" onClick={() => void member.signOut().catch(e => member.notify(e.message))}><LogOut size={18} />Uitloggen</button><Link to="/">Bekijk de kustgids</Link></div>;
  return <MemberDashboard />;
}
