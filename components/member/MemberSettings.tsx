import React, { useState } from 'react';
import { Check, Download, Loader2, LogOut, PawPrint, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { CITIES } from '../../cityData.ts';
import { supabase } from '../../utils/supabaseClient.ts';
import { clearPendingSave, requireMemberMutation, type MemberDog } from '../../utils/memberData.ts';
import { useMember } from './MemberProvider.tsx';
import { MemberDialog } from './MemberUI.tsx';

export default function MemberSettings() {
  const member = useMember(), data = member.data!;
  const [name, setName] = useState(data.profile.display_name);
  const [city, setCity] = useState(data.profile.home_city || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dogEditor, setDogEditor] = useState<MemberDog | 'new' | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [removingDog, setRemovingDog] = useState<MemberDog | null>(null);
  const run = async (action: () => Promise<void>) => {
    setBusy(true); setError(null);
    try { await action(); await member.refresh(); return true; } catch (cause) { setError(cause instanceof Error ? cause.message : 'De wijziging lukte niet.'); return false; } finally { setBusy(false); }
  };
  return <>
    <div className="member-section-heading"><div><p className="member-eyebrow">HELEMAAL VAN JOU</p><h2>Jij & je viervoeters.</h2><p>Een beetje persoonlijker. Precies zoveel als jij wilt.</p></div></div>
    <div className="member-settings-grid">
      <section className="member-panel"><h3>Hoe mogen we je noemen?</h3><p className="member-muted">Je profiel is privé. Alleen jij en het beheer kunnen deze gegevens zien.</p>
        <form onSubmit={async e => { e.preventDefault(); if (await run(async () => { await requireMemberMutation(await supabase.from('member_profiles').update({ display_name: name.trim(), home_city: city || null }).eq('id', data.profile.id).select('id').single()); })) member.notify('Je profiel is bijgewerkt.'); }}>
          <label className="member-field">Je voornaam of bijnaam<input name="display-name" autoComplete="given-name" maxLength={80} placeholder="Hoe heet je?" value={name} onChange={e => setName(e.target.value)} /></label>
          <label className="member-field">Je favoriete thuisbasis <span>optioneel</span><select name="home-city" value={city} onChange={e => setCity(e.target.value)}><option value="">Kies een kustgemeente</option>{CITIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
          <label className="member-field">Je e-mailadres<input type="email" value={data.profile.email} readOnly /></label><p className="member-small-note"><ShieldCheck size={14} />Je e-mailadres om in te loggen</p>
          <button className="member-button member-button-primary" disabled={busy}>{busy ? <Loader2 size={17} className="animate-spin" /> : <Check size={17} />}Bewaar mijn profiel</button>
        </form>
      </section>
      <section className="member-panel"><div className="member-editor-heading"><h3>Wie gaat er mee?</h3><button className="member-text-button" onClick={() => setDogEditor('new')} disabled={data.dogs.length >= 10}><Plus size={16} />Hond toevoegen</button></div><p className="member-muted">Jullie kustavonturen verdienen een naam. Voeg je hond toe, of je hele roedel.</p>
        {data.dogs.length ? <div className="member-dog-list">{data.dogs.map(dog => <div key={dog.id}><span className={`member-dog-avatar dog-${dog.avatar}`}><PawPrint size={26} /></span><button className="member-dog-edit" onClick={() => setDogEditor(dog)}><strong>{dog.name}</strong><small>{dog.breed || 'Klaar voor een dag aan zee'}</small></button><button className="member-icon-button" disabled={busy} onClick={() => setRemovingDog(dog)} aria-label={`Verwijder ${dog.name}`}><Trash2 size={16} /></button></div>)}</div> : <div className="member-dog-empty"><PawPrint size={44} strokeWidth={1.2} /><h4>De ereplek is nog vrij.</h4><p>Vertel ons wie er naast je door het zand rent.</p><button className="member-button member-button-small" onClick={() => setDogEditor('new')}><Plus size={16} />Voeg je hond toe</button></div>}
      </section>
    </div>
    <section className="member-panel member-account-controls"><div><h3>Jouw account, jouw keuze.</h3><p className="member-muted">Download je eigen gegevens of log uit op dit toestel.</p></div><div className="member-button-row"><button className="member-button member-button-small" onClick={() => {
      const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), ...data }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href = url; anchor.download = 'mijn-hond-aan-zee.json'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }}><Download size={16} />Mijn gegevens</button><button className="member-button member-button-small" onClick={() => void member.signOut().catch(e => member.notify(e.message))}><LogOut size={16} />Uitloggen</button></div></section>
    <div className="member-delete-row"><span>Je kunt je account en je bewaarde gegevens verwijderen.</span><button className="member-text-button member-danger-text" onClick={() => { setDeleting(true); setError(null); }}>Account verwijderen</button></div>
    {error && !deleting && <p className="member-error" role="alert">{error}</p>}
    {dogEditor && <DogEditor dog={dogEditor === 'new' ? null : dogEditor} onClose={() => setDogEditor(null)} />}
    {removingDog && <MemberDialog title={`${removingDog.name} verwijderen?`} onClose={() => !busy && setRemovingDog(null)}><div className="member-dialog-body"><p>Dit verwijdert alleen het hondenprofiel. Je favorieten en uitstapjes blijven bewaard.</p><button className="member-button member-button-danger" disabled={busy} onClick={async () => { if (await run(async () => { await requireMemberMutation(await supabase.from('member_dogs').delete().eq('id', removingDog.id)); })) setRemovingDog(null); }}>Ja, verwijder profiel</button>{error && <p className="member-error" role="alert">{error}</p>}</div></MemberDialog>}
    {deleting && <MemberDialog title="Je account verwijderen" onClose={() => !busy && setDeleting(false)}><form className="member-dialog-body" onSubmit={async e => {
      e.preventDefault(); setBusy(true); setError(null);
      try {
        const { error: deleteError } = await supabase.functions.invoke('member-account', { body: { action: 'delete', email: deleteEmail.trim(), confirmation } });
        if (deleteError) {
          const response = deleteError.context instanceof Response ? await deleteError.context.json().catch(() => null) : null;
          throw new Error(response?.error || 'Je account kon niet worden verwijderd. Probeer opnieuw.');
        }
        clearPendingSave(); await supabase.auth.signOut({ scope: 'local' });
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'Verwijderen lukte niet.'); } finally { setBusy(false); }
    }}><p>Je profiel, honden, favorieten, gevolgde gemeenten en uitstapjes worden verwijderd. Je gedeelde links werken daarna niet meer. Dit kun je niet ongedaan maken.</p><label className="member-field">Vul je e-mailadres in<input type="email" autoComplete="email" required value={deleteEmail} onChange={e => setDeleteEmail(e.target.value)} /></label><label className="member-field">Typ VERWIJDER om te bevestigen<input required pattern="VERWIJDER" value={confirmation} onChange={e => setConfirmation(e.target.value)} autoComplete="off" /></label>{error && <p className="member-error" role="alert">{error}</p>}<button className="member-button member-button-danger" disabled={busy || confirmation !== 'VERWIJDER' || deleteEmail.trim().toLowerCase() !== data.profile.email.toLowerCase()}>{busy ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17} />}Verwijder mijn account</button></form></MemberDialog>}
  </>;
}

function DogEditor({ dog, onClose }: { dog: MemberDog | null; onClose: () => void }) {
  const member = useMember();
  const [name, setName] = useState(dog?.name || '');
  const [breed, setBreed] = useState(dog?.breed || '');
  const [avatar, setAvatar] = useState<MemberDog['avatar']>(dog?.avatar || 'sand');
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const colors = { sand: 'Zand', sea: 'Zee', sun: 'Zon', rose: 'Roze' };
  return <MemberDialog title={dog ? `${dog.name}, onze kustheld` : 'Een ereplek voor je hond'} onClose={() => !busy && onClose()}><form className="member-dialog-body" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError(null);
    try {
      const values = { name: name.trim(), breed: breed.trim(), avatar };
      const result = dog ? await supabase.from('member_dogs').update(values).eq('id', dog.id).select('id').single() : await supabase.from('member_dogs').insert({ ...values, member_id: member.data!.profile.id }).select('id').single();
      await requireMemberMutation(result); await member.refresh(); member.notify(`${name.trim()} heeft een plekje in je account.`); onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Opslaan lukte niet.'); } finally { setBusy(false); }
  }}><div className={`member-dog-preview dog-${avatar}`}><PawPrint size={43} strokeWidth={1.4} /></div><fieldset className="member-avatar-options"><legend>Kies een kleur</legend>{Object.entries(colors).map(([value, label]) => <label key={value} className={`dog-${value} ${value === avatar ? 'is-active' : ''}`}><input type="radio" name="dog-avatar" value={value} checked={avatar === value} onChange={() => setAvatar(value as MemberDog['avatar'])} /><span>{label}</span></label>)}</fieldset><label className="member-field">Naam van je hond<input autoFocus name="dog-name" required maxLength={60} placeholder="Bijvoorbeeld: Jax" value={name} onChange={e => setName(e.target.value)} /></label><label className="member-field">Ras of omschrijving <span>optioneel</span><input name="dog-breed" maxLength={80} placeholder="Bijvoorbeeld: vrolijke mix" value={breed} onChange={e => setBreed(e.target.value)} /></label>{error && <p className="member-error" role="alert">{error}</p>}<button className="member-button member-button-primary" disabled={busy || !name.trim()}>{busy ? <Loader2 size={17} className="animate-spin" /> : <PawPrint size={17} />}Bewaar hondenprofiel</button></form></MemberDialog>;
}
