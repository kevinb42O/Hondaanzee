import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Compass, Heart, Loader2, MapPin, PawPrint, Search, ShieldCheck, UserRound, Users } from 'lucide-react';
import { adminFunction } from '../utils/adminContent.ts';
import type { MemberDog, MemberProfile } from '../utils/memberData.ts';
import { CITIES } from '../cityData.ts';
import { MemberDialog, memberDate } from '../components/member/MemberUI.tsx';

type MemberRow = MemberProfile & { favorites_count: number; trips_count: number };
type MemberList = { members: MemberRow[]; total: number; stats: { total: number; new30: number; active30: number; saved: number } };
type MemberDetail = { member: MemberProfile; dogs: MemberDog[]; towns: { city_slug: string }[]; favorites_count: number; trips_count: number };

export default function AdminMembers() {
  const [search, setSearch] = useState(''), [status, setStatus] = useState(''), [page, setPage] = useState(1);
  const [payload, setPayload] = useState<MemberList | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0), [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    let active = true; setLoading(true); setError(null);
    const timer = setTimeout(() => {
      void adminFunction<MemberList>('admin-members', { action: 'list', search, status, page }).then(data => { if (active) setPayload(data); }).catch(cause => { if (active) setError(cause.message); }).finally(() => { if (active) setLoading(false); });
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [search, status, page, revision]);
  return <>
    <div className="workspace-page-heading"><div><p className="workspace-eyebrow">De mensen achter de zandpoten</p><h1>Je kust krijgt gezichten.</h1><p>Bekijk wie een account heeft en hoe de leden hun kustgids gebruiken.</p></div><span className="workspace-member-label"><Users size={17} />Ledenbeheer</span></div>
    {payload && <div className="workspace-stats workspace-member-stats">{[{ label: 'Accounts', count: payload.stats.total, text: 'Alle geregistreerde accounts', icon: Users }, { label: 'Nieuw in 30 dagen', count: payload.stats.new30, text: 'Recent geregistreerde accounts', icon: UserRound }, { label: 'Actief in 30 dagen', count: payload.stats.active30, text: 'Leden met accountgebruik', icon: Compass }, { label: 'Eerste plek bewaard', count: payload.stats.saved, text: 'Leden met minstens één favoriet', icon: Heart }].map(({ label, count, text, icon: Icon }) => <section className="workspace-stat" key={label}><span><Icon size={16} />{label}</span><strong>{count}</strong><small>{text}</small></section>)}</div>}
    <section className="workspace-panel"><div className="workspace-section-heading"><div><h2>Alle leden</h2><p className="workspace-muted">{payload ? `${payload.total} ${payload.total === 1 ? 'account' : 'accounts'}${search || status ? ' in deze selectie' : ''}` : 'Je ledenlijst wordt geladen.'}</p></div></div>
      <div className="workspace-filters workspace-member-filters"><label><span>Zoek een lid</span><input type="search" aria-label="Zoek leden op naam of e-mail" placeholder="Naam of e-mailadres" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></label><label><span>Accountstatus</span><select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">Alle accounts</option><option value="active">Actief</option><option value="suspended">Geschorst</option></select></label></div>
      {error && <p className="workspace-error" role="alert">{error}<button type="button" className="workspace-text-link" onClick={() => setRevision(v => v + 1)}>Probeer opnieuw</button></p>}
      {loading && <p className="workspace-muted flex items-center gap-2" role="status"><Loader2 size={16} className="animate-spin" />Leden laden…</p>}
      {!error && payload?.members.length > 0 && <div className="workspace-table-scroll"><table className="workspace-table workspace-members-table"><thead><tr><th>Lid</th><th>Status</th><th>Aangemaakt</th><th>Laatst actief</th><th>Bewaard</th><th><span className="sr-only">Open profiel</span></th></tr></thead><tbody>{payload.members.map(member => <tr key={member.id}><td><button className="workspace-member-identity" onClick={() => setSelected(member.id)}><span className="workspace-member-avatar">{member.display_name ? member.display_name.charAt(0).toUpperCase() : <UserRound size={18} />}</span><span><strong>{member.display_name || 'Nog geen naam ingevuld'}</strong><small>{member.email}</small></span></button></td><td><span className={`workspace-member-status member-status-${member.status}`}>{member.status === 'suspended' ? 'Geschorst' : 'Actief'}</span></td><td>{memberDate(member.created_at)}</td><td>{memberDate(member.last_active_at)}</td><td><span className="workspace-member-counts"><Heart size={13} />{member.favorites_count}<Compass size={13} />{member.trips_count}</span></td><td><button className="workspace-button workspace-member-open" aria-label={`Open account van ${member.display_name || member.email}`} onClick={() => setSelected(member.id)}><ArrowRight size={16} /></button></td></tr>)}</tbody></table></div>}
      {!loading && !error && payload?.members.length === 0 && <div className="workspace-empty"><Users size={33} /><h2>{search || status ? 'Geen leden gevonden' : 'De eerste leden zijn onderweg.'}</h2><p>{search || status ? 'Probeer een andere naam of reset je filters.' : 'Zodra iemand een account maakt, verschijnt die hier automatisch.'}</p>{(search || status) && <button className="workspace-button" onClick={() => { setSearch(''); setStatus(''); setPage(1); }}>Wis filters</button>}</div>}
      {payload && payload.total > 25 && <div className="workspace-member-pagination"><button className="workspace-button" disabled={loading || page <= 1} onClick={() => setPage(p => p - 1)}><ArrowLeft size={15} />Vorige</button><span>Pagina {page} van {Math.ceil(payload.total / 25)}</span><button className="workspace-button" disabled={loading || page * 25 >= payload.total} onClick={() => setPage(p => p + 1)}>Volgende<ArrowRight size={15} /></button></div>}
    </section>
    <p className="workspace-note">Accountgebruik wordt maximaal eenmaal per uur bijgewerkt. Persoonlijke notities en uitstapcollecties blijven privé. De tellingen tonen aantallen; ze geven geen inzage in de inhoud.</p>
    {selected && <MemberDetailDialog id={selected} onClose={() => setSelected(null)} onChange={() => setRevision(v => v + 1)} />}
  </>;
}

function MemberDetailDialog({ id, onClose, onChange }: { id: string; onClose: () => void; onChange: () => void }) {
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null), [confirming, setConfirming] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true; setLoading(true); setError(null);
    void adminFunction<MemberDetail>('admin-members', { action: 'detail', id }).then(data => { if (active) setDetail(data); }).catch(cause => { if (active) setError(cause.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, revision]);
  const suspended = detail?.member.status === 'suspended';
  return <MemberDialog title="Ledenprofiel" onClose={() => !busy && onClose()} wide><div className="member-dialog-body workspace-member-detail">
    {loading && <p className="workspace-muted" role="status">Profiel laden…</p>}
    {detail && <><div className="workspace-member-detail-heading"><span className="workspace-member-avatar">{detail.member.display_name.charAt(0).toUpperCase() || <UserRound size={25} />}</span><div><h3>{detail.member.display_name || 'Nog geen naam ingevuld'}</h3><p>{detail.member.email}</p></div><span className={`workspace-member-status member-status-${detail.member.status}`}>{suspended ? 'Geschorst' : 'Actief'}</span></div><dl className="workspace-member-details"><div><dt>Account aangemaakt</dt><dd>{memberDate(detail.member.created_at)}</dd></div><div><dt>Laatst account gebruikt</dt><dd>{memberDate(detail.member.last_active_at)}</dd></div><div><dt>Thuisbasis</dt><dd>{CITIES.find(c => c.slug === detail.member.home_city)?.name || 'Niet ingevuld'}</dd></div><div><dt>Favorieten</dt><dd>{detail.favorites_count}</dd></div><div><dt>Uitstapjes</dt><dd>{detail.trips_count}</dd></div></dl>
      <h4><MapPin size={16} />Gevolgde gemeenten</h4><div className="workspace-member-chips">{detail.towns.length ? detail.towns.map(t => <span key={t.city_slug}>{CITIES.find(c => c.slug === t.city_slug)?.name || t.city_slug}</span>) : <p className="workspace-muted">Nog geen gemeenten gevolgd.</p>}</div><h4><PawPrint size={16} />Honden</h4><div className="workspace-member-chips">{detail.dogs.length ? detail.dogs.map((dog, index) => <span key={index}>{dog.name}{dog.breed && ` · ${dog.breed}`}</span>) : <p className="workspace-muted">Nog geen hondenprofiel toegevoegd.</p>}</div>
      <div className="workspace-member-actions">{confirming ? <><p>{suspended ? 'Dit lid kan na heractivering opnieuw zijn account gebruiken.' : 'Dit lid verliest toegang tot opgeslagen gegevens. Gedeelde uitstaplinks worden ook geblokkeerd.'}</p><div className="member-button-row"><button className={`workspace-button ${suspended ? 'workspace-button-primary' : 'workspace-button-danger'}`} disabled={busy} onClick={async () => { setBusy(true); setError(null); try { await adminFunction('admin-members', { action: 'status', id, status: suspended ? 'active' : 'suspended' }); setConfirming(false); setRevision(v => v + 1); onChange(); } catch (cause) { setError(cause.message); } finally { setBusy(false); } }}>{busy ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}{suspended ? 'Ja, heractiveer account' : 'Ja, schors account'}</button><button className="workspace-button" disabled={busy} onClick={() => setConfirming(false)}>Annuleren</button></div></> : <button className={`workspace-button ${suspended ? '' : 'workspace-button-danger'}`} onClick={() => setConfirming(true)}><ShieldCheck size={16} />{suspended ? 'Account heractiveren' : 'Account schorsen'}</button>}</div>
    </>}
    {error && <p className="workspace-error" role="alert">{error}{!detail && <button className="workspace-text-link" onClick={() => setRevision(v => v + 1)}>Probeer opnieuw</button>}</p>}
  </div></MemberDialog>;
}
