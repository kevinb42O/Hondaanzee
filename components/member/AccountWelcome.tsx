import React, { useState } from 'react';
import { ArrowRight, Compass, Eye, EyeOff, Heart, Loader2, LockKeyhole, MapPin, PawPrint, ShieldCheck, Waves } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient.ts';
import { readPendingSave, resolveSavedPlace } from '../../utils/memberData.ts';
import { validateMemberPassword } from '../../utils/memberCredentials.ts';

export default function AccountWelcome() {
  const [params, setParams] = useSearchParams();
  const registering = params.get('mode') === 'register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = readPendingSave();
  const place = pending && resolveSavedPlace(pending);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = registering ? validateMemberPassword(password, repeatPassword) : null;
    if (validation) { setError(validation); return; }
    setBusy(true); setError(null);
    const address = email.trim().toLowerCase();
    try {
      const { data, error: authError } = registering
        ? await supabase.auth.signUp({ email: address, password })
        : await supabase.auth.signInWithPassword({ email: address, password });
      if (authError) {
        if (authError.status === 429) setError('Even geduld: er zijn te veel aanvragen. Probeer over enkele minuten opnieuw.');
        else if (authError.code === 'weak_password') setError('Kies een sterker wachtwoord, bijvoorbeeld een langere zin met meerdere woorden.');
        else setError(registering ? 'Registratie is niet gelukt. Mogelijk heb je al een account. Probeer inloggen of gebruik een ander e-mailadres.' : 'Je e-mailadres of wachtwoord klopt niet. Controleer je gegevens en probeer opnieuw.');
        return;
      }
      if (!data.session) { setError('Registratie kan momenteel niet worden afgerond. Neem contact op via info@hondaanzee.be.'); return; }
      setPassword(''); setRepeatPassword('');
    } catch { setError('Er is geen verbinding met je account. Controleer je internetverbinding en probeer opnieuw.'); }
    finally { setBusy(false); }
  };
  const switchMode = (mode: 'register' | 'login') => {
    const next = new URLSearchParams(params); next.set('mode', mode); setParams(next, { replace: true });
    setError(null); setPassword(''); setRepeatPassword('');
  };
  return <div className="member-welcome">
    <div className="member-welcome-shell">
      <section className="member-welcome-story">
        <p className="member-eyebrow"><Waves size={18} /> JOUW EIGEN STUKJE KUST</p>
        <h1>Meer zee.<br />Meer <span>samen.</span></h1>
        <p className="member-welcome-intro">De leukste plekjes, jullie volgende uitstap en je favoriete kustgemeenten. Allemaal op één plek. Helemaal van jou.</p>
        <div className="member-welcome-photo"><img src="/happy-dog-strand.webp" alt="Een hond geniet van het strand aan zee" fetchPriority="high" /><div className="member-photo-note"><Heart size={20} fill="currentColor" /><span>Voor alle dagen<br /><strong>met zand tussen de poten.</strong></span></div><span className="member-photo-stamp"><PawPrint size={25} /><span>HOND<br />AAN ZEE</span></span></div>
        <div className="member-welcome-perks">{[{ icon: Heart, title: 'Bewaar je plekjes', text: 'Overal bij de hand' }, { icon: Compass, title: 'Plan iets moois', text: 'Jouw eigen uitstapjes' }, { icon: MapPin, title: 'Volg jouw kust', text: 'Gemeenten die je graag ziet' }].map(({ icon: Icon, title, text }) => <div key={title}><Icon size={20} /><strong>{title}</strong><span>{text}</span></div>)}</div>
      </section>
      <section className="member-auth-card" aria-labelledby="account-form-title">
        <div className="member-auth-brand"><PawPrint size={25} /><span>mijn hond aan zee</span></div>
        <div className="member-auth-tabs" aria-label="Accountkeuze"><button type="button" disabled={busy} className={registering ? '' : 'is-active'} onClick={() => switchMode('login')}>Inloggen</button><button type="button" disabled={busy} className={registering ? 'is-active' : ''} onClick={() => switchMode('register')}>Gratis account</button></div>
        <h2 id="account-form-title">{registering ? 'Jouw kust begint hier.' : 'Fijn dat je er weer bent.'}</h2><p>{registering ? 'Maak je eigen verzameling van fijne plekken en plannen. Gratis, voor jou en je viervoeter.' : 'Je favoriete plekjes en plannen wachten op je. Log in met je e-mailadres en wachtwoord.'}</p>
        {place && <div className="member-pending-save"><img src={place.image} alt="" /><span><small>Je eerste favoriet staat klaar</small><strong>{place.name}</strong></span><Heart size={18} /></div>}
        <form onSubmit={submit}>
          <label className="member-field">Je e-mailadres<input type="email" name="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="jij@voorbeeld.be" maxLength={254} required disabled={busy} value={email} onChange={e => setEmail(e.target.value)} /></label>
          <PasswordField key={registering ? 'new' : 'current'} label="Je wachtwoord" name="password" autoComplete={registering ? 'new-password' : 'current-password'} value={password} onChange={setPassword} disabled={busy} minimum={registering ? 8 : undefined} />
          {registering && <><p className="member-password-hint">Minstens 8 tekens. Een langere zin is makkelijk te onthouden.</p><PasswordField label="Herhaal je wachtwoord" name="password-repeat" autoComplete="new-password" value={repeatPassword} onChange={setRepeatPassword} disabled={busy} minimum={8} /><label className="member-checkbox"><input type="checkbox" required name="terms" disabled={busy} /><span>Ik ga akkoord met de <Link to="/algemene-voorwaarden">voorwaarden</Link> en heb het <Link to="/privacy">privacybeleid</Link> gelezen.</span></label></>}
          {error && <p className="member-error" role="alert">{error}</p>}
          <button className="member-button member-button-primary" disabled={busy}>{busy ? <Loader2 size={17} className="animate-spin" /> : <LockKeyhole size={18} />}{busy ? 'Even geduld…' : registering ? 'Maak mijn gratis account' : 'Inloggen'}<ArrowRight size={17} /></button>
        </form>
        <div className="member-auth-reassurance"><ShieldCheck size={17} /><span>{registering ? 'Meteen aan de slag. Geen nieuwsbrief zonder jouw keuze.' : <>Hulp nodig met inloggen? <a href="mailto:info@hondaanzee.be">Neem contact op.</a></>}</span></div>
        <div className="member-auth-footer"><Waves size={15} />Een betere dag aan zee, samen.</div>
      </section>
    </div>
  </div>;
}

function PasswordField({ label, name, value, onChange, autoComplete, disabled, minimum }: { label: string; name: string; value: string; onChange: (value: string) => void; autoComplete: string; disabled: boolean; minimum?: number }) {
  const [visible, setVisible] = useState(false);
  return <label className="member-field">{label}<span className="member-password-input"><input type={visible ? 'text' : 'password'} name={name} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete} autoCapitalize="none" spellCheck={false} required minLength={minimum} maxLength={128} disabled={disabled} /><button type="button" disabled={disabled} aria-label={`${visible ? 'Verberg' : 'Toon'} ${name === 'password-repeat' ? 'herhaald wachtwoord' : 'wachtwoord'}`} aria-pressed={visible} onClick={() => setVisible(v => !v)}>{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></span></label>;
}
