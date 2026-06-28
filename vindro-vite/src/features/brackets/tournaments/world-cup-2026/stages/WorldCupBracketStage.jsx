import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// ── Bracket graph helpers ────────────────────────────────────────────────────
// A bracket is { R32:[...], R16:[...], QF:[...], SF:[...], "3rd":[...], F:[...] }.
// R32 matches carry concrete team objects {name, flag} in home/away. Later rounds
// reference earlier matches by string: "W74" = winner of match 74, "L101" = loser
// of match 101. The user's picks live in each match's `winner` (a team object).

const ROUND_ORDER = ['R32', 'R16', 'QF', 'SF', '3rd', 'F'];

const clone = (o) => JSON.parse(JSON.stringify(o ?? {}));

const sameTeam = (a, b) => !!a && !!b && a.name === b.name && a.flag === b.flag;

const buildIndex = (bracket) => {
    const idx = {};
    Object.values(bracket || {}).forEach((round) => {
        if (Array.isArray(round)) round.forEach((m) => { if (m && m.id != null) idx[String(m.id)] = m; });
    });
    return idx;
};

// Resolve a home/away reference into a concrete team object, or null if not yet known.
const resolveTeam = (ref, byId, depth = 0) => {
    if (!ref || depth > 12) return null;
    if (typeof ref === 'object') return ref;
    const s = String(ref);
    if (s[0] === 'W') {
        const m = byId[s.slice(1)];
        return m ? resolveTeam(m.winner, byId, depth + 1) : null;
    }
    if (s[0] === 'L') {
        const m = byId[s.slice(1)];
        if (!m) return null;
        const w = resolveTeam(m.winner, byId, depth + 1);
        if (!w) return null;
        const h = resolveTeam(m.home, byId, depth + 1);
        const a = resolveTeam(m.away, byId, depth + 1);
        return sameTeam(w, h) ? a : h;
    }
    return null; // unresolved group placeholder ("2A") — shouldn't happen post-seed
};

// The match that consumes a given match's winner (the one referencing "W<id>").
const buildParentOf = (bracket) => {
    const parent = {};
    Object.values(bracket || {}).forEach((round) => {
        if (!Array.isArray(round)) return;
        round.forEach((m) => {
            ['home', 'away'].forEach((side) => {
                const ref = m && m[side];
                if (typeof ref === 'string' && ref[0] === 'W') parent[ref.slice(1)] = String(m.id);
            });
        });
    });
    return parent;
};

const childMatch = (ref, byId) => (typeof ref === 'string' && ref[0] === 'W') ? byId[ref.slice(1)] : null;

// Drop any winner that is no longer one of its match's two (resolved) sides.
// Cascades upward so changing an early pick clears the picks that depended on it.
const normalize = (bracket) => {
    const byId = buildIndex(bracket);
    let changed = true, guard = 0;
    while (changed && guard++ < 12) {
        changed = false;
        ROUND_ORDER.forEach((r) => (bracket[r] || []).forEach((m) => {
            if (!m || !m.winner) return;
            const w = resolveTeam(m.winner, byId);
            const h = resolveTeam(m.home, byId);
            const a = resolveTeam(m.away, byId);
            if (!sameTeam(w, h) && !sameTeam(w, a)) { m.winner = null; changed = true; }
        }));
    }
};

// ── Presentational pieces ────────────────────────────────────────────────────
const TeamLabel = ({ team, t }) => {
    if (!team) return null;
    return (
        <>
            <span className={`fi fi-${String(team.flag).toLowerCase()} bk-team-flag`} />
            <span className="bk-team-name">{t ? t(team.name) : team.name}</span>
        </>
    );
};

const Card = ({ team, selected, clickable, onClick, t }) => (
    <div
        className={`team-card${!team ? ' team-card--empty' : ''}${selected ? ' team-card--selected' : ''}${clickable && team ? ' team-card--clickable' : ''}`}
        onClick={clickable && team ? onClick : undefined}
        role={clickable && team ? 'button' : undefined}
    >
        <TeamLabel team={team} t={t} />
    </div>
);

// An R32 match: two teams, tap one to set this match's winner.
const R32Match = ({ match, byId, isEditing, onPick, t }) => {
    const home = resolveTeam(match.home, byId);
    const away = resolveTeam(match.away, byId);
    const w = resolveTeam(match.winner, byId);
    return (
        <div className="teams-container">
            <Card team={home} selected={sameTeam(w, home)} clickable={isEditing} onClick={() => onPick(match.id, home)} t={t} />
            <Card team={away} selected={sameTeam(w, away)} clickable={isEditing} onClick={() => onPick(match.id, away)} t={t} />
        </div>
    );
};

// A "winner advances" slot: shows the winner of `source`; tapping promotes that
// team into its parent match (the next round).
const AdvanceSlot = ({ source, byId, parentOf, isEditing, onPick, t }) => {
    const team = resolveTeam(source?.winner, byId);
    const parentId = source ? parentOf[String(source.id)] : null;
    const parent = parentId ? byId[parentId] : null;
    const selected = parent ? sameTeam(team, resolveTeam(parent.winner, byId)) : false;
    return (
        <div className="teams-container">
            <Card
                team={team}
                selected={selected}
                clickable={isEditing && !!parentId}
                onClick={() => onPick(parentId, team)}
                t={t}
            />
        </div>
    );
};

const ConnL = () => (
    <div className="rounds-connect-container">
        <div className="two-lines"><div className="line" /><div className="line" /></div>
        <div className="center-vertical" />
        <div className="one-line"><div className="line" /></div>
    </div>
);

const ConnR = () => (
    <div className="rounds-connect-container">
        <div className="one-line"><div className="line" /></div>
        <div className="center-vertical" />
        <div className="two-lines"><div className="line" /><div className="line" /></div>
    </div>
);

// One quarter of the tree, derived from its QF match by walking the W-references.
const QuarterCard = ({ qf, side, byId, parentOf, isEditing, onPick, t, activeRound }) => {
    const r16s = [childMatch(qf.home, byId), childMatch(qf.away, byId)].filter(Boolean);
    const r32s = r16s.flatMap((r16) => [childMatch(r16.home, byId), childMatch(r16.away, byId)].filter(Boolean));
    const Conn = side === 'left' ? ConnL : ConnR;

    const col1 = (
        <div className="round-col round-1-col" key="c1">
            {r32s.map((m) => <R32Match key={m.id} match={m} byId={byId} isEditing={isEditing} onPick={onPick} t={t} />)}
        </div>
    );
    const conn1 = <div className="connector-col" key="x1">{r32s.map((m) => <Conn key={m.id} />)}</div>;
    const col2 = (
        <div className="round-col round-2-col" key="c2">
            {r32s.map((m) => <AdvanceSlot key={m.id} source={m} byId={byId} parentOf={parentOf} isEditing={isEditing} onPick={onPick} t={t} />)}
        </div>
    );
    const conn2 = <div className="connector-col" key="x2">{r16s.map((m) => <Conn key={m.id} />)}</div>;
    const col3 = (
        <div className="round-col round-3-col" key="c3">
            {r16s.map((m) => <AdvanceSlot key={m.id} source={m} byId={byId} parentOf={parentOf} isEditing={isEditing} onPick={onPick} t={t} />)}
        </div>
    );
    const conn3 = <div className="connector-col" key="x3"><Conn /></div>;
    const col4 = (
        <div className="round-col round-4-col" key="c4">
            <AdvanceSlot source={qf} byId={byId} parentOf={parentOf} isEditing={isEditing} onPick={onPick} t={t} />
        </div>
    );

    const cols = side === 'left'
        ? [col1, conn1, col2, conn2, col3, conn3, col4]
        : [col4, conn3, col3, conn2, col2, conn1, col1];

    return <div className={`bk-quarter-card bk-quarter-card--${side}`} data-round={activeRound}>{cols}</div>;
};

// Read-only fallback (e.g. the pre-open teaser seed, which has no W-graph / final).
const FlatR32 = ({ r32, byId, t }) => (
    <div className="bk-flat-r32">
        {(r32 || []).map((m) => <R32Match key={m.id} match={m} byId={byId} isEditing={false} onPick={() => {}} t={t} />)}
    </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const WorldCupBracketStage = ({ data, isEditable, onSave, loginBanner, cancelEditRef, onEditingChange }) => {
    const { t } = useTranslation('tournament');
    const [activeSection, setActiveSection] = useState('left');
    const [activeRound, setActiveRound] = useState('R32');
    const [isEditing, setIsEditing] = useState(false);
    const [working, setWorking] = useState(() => clone(data));

    useEffect(() => { setWorking(clone(data)); }, [data]);

    useEffect(() => {
        if (!cancelEditRef) return;
        cancelEditRef.current = () => {
            setWorking(clone(data));
            setIsEditing(false);
            onEditingChange?.('bk-editing', false);
        };
    });

    const byId = useMemo(() => buildIndex(working), [working]);
    const parentOf = useMemo(() => buildParentOf(working), [working]);

    const onPick = (targetId, team) => {
        if (!isEditing || !targetId || !team) return;
        setWorking((prev) => {
            const next = clone(prev);
            const idx = buildIndex(next);
            const m = idx[String(targetId)];
            if (!m) return prev;
            m.winner = sameTeam(resolveTeam(m.winner, idx), team) ? null : team; // tap again to clear
            normalize(next);
            return next;
        });
    };

    const startEditing = () => { setIsEditing(true); onEditingChange?.('bk-editing', true); };

    const handleSave = async () => {
        if (typeof onSave === 'function') {
            try {
                await onSave(working);
                setIsEditing(false);
                onEditingChange?.('bk-editing', false);
            } catch (e) {
                if (e?.message !== 'login_required') {
                    setIsEditing(false);
                    onEditingChange?.('bk-editing', false);
                }
            }
        } else {
            setIsEditing(false);
            onEditingChange?.('bk-editing', false);
        }
    };

    // Derive the tree purely from the Final match by following references.
    const finalMatch = working.F?.[0];
    const thirdMatch = working['3rd']?.[0];
    const sfLeft = childMatch(finalMatch?.home, byId);
    const sfRight = childMatch(finalMatch?.away, byId);
    const qfLeft = sfLeft ? [childMatch(sfLeft.home, byId), childMatch(sfLeft.away, byId)].filter(Boolean) : [];
    const qfRight = sfRight ? [childMatch(sfRight.home, byId), childMatch(sfRight.away, byId)].filter(Boolean) : [];
    const treeReady = qfLeft.length === 2 && qfRight.length === 2;

    const champion = resolveTeam(finalMatch?.winner, byId);
    const finalists = [resolveTeam(sfLeft?.winner, byId), resolveTeam(sfRight?.winner, byId)];
    const thirdHome = resolveTeam(thirdMatch?.home, byId);
    const thirdAway = resolveTeam(thirdMatch?.away, byId);
    const thirdWinner = resolveTeam(thirdMatch?.winner, byId);

    const editBtn = isEditable && (
        <button
            className={`btn gallery-edit-btn${isEditing ? ' active' : ''}`}
            onClick={isEditing ? handleSave : startEditing}
        >
            {isEditing ? 'save' : 'edit bracket'}
        </button>
    );

    if (!treeReady) {
        return (
            <div className="bk-stage">
                {editBtn}
                {loginBanner}
                <FlatR32 r32={working.R32} byId={byId} t={t} />
            </div>
        );
    }

    return (
        <div className={`bk-stage${isEditing ? ' bk-stage--editing' : ''}`}>
            {editBtn}
            {loginBanner}

            <div className="bk-stage-container">
                <div className="bk-half-toggle">
                    <button className={`bk-tab${activeSection === 'left' ? ' bk-tab--active' : ''}`} onClick={() => setActiveSection('left')}>Left</button>
                    <button className={`bk-tab${activeSection === 'center' ? ' bk-tab--active' : ''}`} onClick={() => setActiveSection('center')}>Finals</button>
                    <button className={`bk-tab${activeSection === 'right' ? ' bk-tab--active' : ''}`} onClick={() => setActiveSection('right')}>Right</button>
                </div>

                <div className="bk-medium-tabs">
                    {['R32', 'R16', 'QF', 'SF'].map((round) => (
                        <button
                            key={round}
                            className={`bk-tab${activeRound === round ? ' bk-tab--active' : ''}`}
                            onClick={() => setActiveRound(round)}
                        >
                            {round}
                        </button>
                    ))}
                </div>

                <div className="bk-tree" data-section={activeSection}>
                    <div className="bk-bracket-half bk-bracket-half--left">
                        {qfLeft.map((qf) => (
                            <QuarterCard key={qf.id} qf={qf} side="left" byId={byId} parentOf={parentOf} isEditing={isEditing} onPick={onPick} t={t} activeRound={activeRound} />
                        ))}
                    </div>

                    <div className="bk-center">
                        <div className="connector-col"><div className="rounds-connect-container"><div className="two-lines"><div className="line" /><div className="line" /></div><div className="center-vertical" /><div className="one-line"><div className="line" /></div></div></div>

                        <div className="round-col round-col-finals">
                            <div className="teams-container">
                                <h6>Champion</h6>
                                <div className={`team-card team-card--champion${!champion ? ' team-card--empty' : ''}`}><TeamLabel team={champion} t={t} /></div>
                            </div>
                            <div className="teams-container">
                                <h6>Final</h6>
                                {finalists.map((team, i) => (
                                    <Card
                                        key={i}
                                        team={team}
                                        selected={sameTeam(champion, team)}
                                        clickable={isEditing && !!finalMatch}
                                        onClick={() => onPick(finalMatch.id, team)}
                                        t={t}
                                    />
                                ))}
                            </div>
                            <div className="teams-container">
                                <h6>3rd place</h6>
                                <Card team={thirdHome} selected={sameTeam(thirdWinner, thirdHome)} clickable={isEditing && !!thirdMatch} onClick={() => onPick(thirdMatch.id, thirdHome)} t={t} />
                                <Card team={thirdAway} selected={sameTeam(thirdWinner, thirdAway)} clickable={isEditing && !!thirdMatch} onClick={() => onPick(thirdMatch.id, thirdAway)} t={t} />
                            </div>
                        </div>

                        <div className="connector-col"><div className="rounds-connect-container"><div className="one-line"><div className="line" /></div><div className="center-vertical" /><div className="two-lines"><div className="line" /><div className="line" /></div></div></div>
                    </div>

                    <div className="bk-bracket-half bk-bracket-half--right">
                        {qfRight.map((qf) => (
                            <QuarterCard key={qf.id} qf={qf} side="right" byId={byId} parentOf={parentOf} isEditing={isEditing} onPick={onPick} t={t} activeRound={activeRound} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorldCupBracketStage;
