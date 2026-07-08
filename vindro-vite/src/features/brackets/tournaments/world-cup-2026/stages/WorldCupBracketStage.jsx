import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BracketScoreSummary from '../../../components/BracketScoreSummary';
import { getMatchStatus, POINTS_BY_ROUND } from '../../../utils/matchStatus';
import '../../../styles/matchStatus.scss';

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

const Card = ({ team, selected, clickable, onClick, t, isCorrectPick, isIncorrectPick, isActualWinner, isPending, showWinnerCheck, points }) => {
    let statusClass = '';
    if (isCorrectPick) statusClass = ' team-card--correct-pick';
    else if (isIncorrectPick) statusClass = ' team-card--incorrect-pick';
    else if (isActualWinner && !isCorrectPick) statusClass = ' team-card--actual-winner';
    else if (isPending && selected) statusClass = ' team-card--user-pick-pending';

    return (
        <div
            className={`team-card${!team ? ' team-card--empty' : ''}${selected ? ' team-card--selected' : ''}${clickable && team ? ' team-card--clickable' : ''}${statusClass}`}
            onClick={clickable && team ? onClick : undefined}
            role={clickable && team ? 'button' : undefined}
        >
            <TeamLabel team={team} t={t} />
            {showWinnerCheck && isActualWinner && <span className="winner-check">✓</span>}
            {points != null && <span className="points-chip">{points}</span>}
        </div>
    );
};

// Key for the card colors, shown once results exist. Must mirror the states
// defined in matchStatus.scss.
const BracketLegend = () => (
    <div className="bk-legend">
        <span className="bk-legend-item">
            <span className="bk-legend-swatch swatch-correct" />
            <span className="legend-text">Correct pick — points earned</span>
        </span>
        <span className="bk-legend-item legend-incorrect">
            <span className="bk-legend-swatch swatch-incorrect" />
            <span className="legend-text">Your pick, eliminated</span>
        </span>
        <span className="bk-legend-item">
            <span className="bk-legend-swatch swatch-winner" />
            <span className="legend-text">Match winner ✓</span>
        </span>
        <span className="bk-legend-item">
            <span className="bk-legend-swatch swatch-pending" />
            <span className="legend-text">Your pick, not played yet</span>
        </span>
    </div>
);

// A bracket match: two teams (resolved from the user's bracket), tap one to set
// this match's winner. Works for any round — `roundKey` selects the official
// results and the points value. For R16+ the displayed teams are the user's
// predicted entrants, so the real winner may not be on either card; in that
// case it is surfaced on a line below the match.
const BracketMatch = ({ match, roundKey, byId, isEditing, onPick, t, officialResults }) => {
    const home = resolveTeam(match.home, byId);
    const away = resolveTeam(match.away, byId);
    const w = resolveTeam(match.winner, byId);

    // Get official result for this match
    const officialMatch = officialResults?.[roundKey]?.find(m => m.id === match.id);
    const actualWinner = officialMatch?.winner;

    // Calculate match status
    const status = getMatchStatus(match, w, actualWinner, POINTS_BY_ROUND[roundKey] || 0);

    // Check if each team is the actual winner (name-based, matching backend scoring)
    const homeIsActualWinner = !!actualWinner && !!home && actualWinner.name === home.name;
    const awayIsActualWinner = !!actualWinner && !!away && actualWinner.name === away.name;

    // Check if user's pick matches the actual winner
    const userPickedHome = w && home && sameTeam(w, home);
    const userPickedAway = w && away && sameTeam(w, away);
    const homeIsCorrect = userPickedHome && homeIsActualWinner;
    const awayIsCorrect = userPickedAway && awayIsActualWinner;
    const homeIsIncorrect = !!actualWinner && userPickedHome && !homeIsActualWinner;
    const awayIsIncorrect = !!actualWinner && userPickedAway && !awayIsActualWinner;

    // Real winner isn't among the user's predicted entrants — show it below
    const winnerNotShown = !!actualWinner && !homeIsActualWinner && !awayIsActualWinner;

    // Points render inside the picked card so they can't be misread as
    // belonging to the other team of the match.
    const pointsPerMatch = POINTS_BY_ROUND[roundKey] || 0;
    const pointsFor = (isCorrect, isIncorrect) => {
        if (isEditing) return null;
        if (isCorrect) return `+${pointsPerMatch}`;
        if (isIncorrect) return '+0';
        return null;
    };

    return (
        <div className={`teams-container match-${status.class}`}>
            {/* Only the "no pick" state keeps a match-level tag (in flow, never
                overlapping a card) — earned points live on the picked card */}
            {status.class === 'no-pick' && !isEditing && (
                <div className={`match-status-badge badge-${status.class}`}>
                    <span className="badge-icon">{status.badge.icon}</span>
                    <span className="badge-text">{status.badge.text}</span>
                </div>
            )}

            {/* Team Cards */}
            <Card
                team={home}
                selected={userPickedHome}
                clickable={isEditing}
                onClick={() => onPick(match.id, home)}
                t={t}
                isCorrectPick={homeIsCorrect}
                isIncorrectPick={homeIsIncorrect}
                isActualWinner={homeIsActualWinner}
                isPending={!actualWinner}
                showWinnerCheck={!isEditing && homeIsActualWinner}
                points={pointsFor(homeIsCorrect, homeIsIncorrect)}
            />
            <Card
                team={away}
                selected={userPickedAway}
                clickable={isEditing}
                onClick={() => onPick(match.id, away)}
                t={t}
                isCorrectPick={awayIsCorrect}
                isIncorrectPick={awayIsIncorrect}
                isActualWinner={awayIsActualWinner}
                isPending={!actualWinner}
                showWinnerCheck={!isEditing && awayIsActualWinner}
                points={pointsFor(awayIsCorrect, awayIsIncorrect)}
            />

            {winnerNotShown && !isEditing && (
                <div className="match-actual-winner">
                    <span className="awl-check">✓</span>
                    <TeamLabel team={actualWinner} t={t} />
                </div>
            )}
        </div>
    );
};

// A "winner advances" slot: shows the winner of `source`; tapping promotes that
// team into its parent match (the next round). Result badges live on the
// BracketMatch containers, not here.
const AdvanceSlot = ({ source, byId, parentOf, isEditing, onPick, t }) => {
    const team = resolveTeam(source?.winner, byId);
    const parentId = source ? parentOf[String(source.id)] : null;
    const parent = parentId ? byId[parentId] : null;
    const selected = parent ? sameTeam(team, resolveTeam(parent.winner, byId)) : false;

    return (
        <div className="teams-container match-pending">
            <Card
                team={team}
                selected={selected}
                clickable={isEditing && !!parentId}
                onClick={() => onPick(parentId, team)}
                t={t}
                isPending
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
// Column semantics (must match the data-round mobile CSS): col1 = R32 matches,
// col2 = R16 matches, col3 = QF match, col4 = the team advancing to the SF.
const QuarterCard = ({ qf, side, byId, parentOf, isEditing, onPick, t, activeRound, officialResults }) => {
    const r16s = [childMatch(qf.home, byId), childMatch(qf.away, byId)].filter(Boolean);
    const r32s = r16s.flatMap((r16) => [childMatch(r16.home, byId), childMatch(r16.away, byId)].filter(Boolean));
    const Conn = side === 'left' ? ConnL : ConnR;

    const col1 = (
        <div className="round-col round-1-col" key="c1">
            {r32s.map((m) => <BracketMatch key={m.id} match={m} roundKey="R32" byId={byId} isEditing={isEditing} onPick={onPick} t={t} officialResults={officialResults} />)}
        </div>
    );
    const conn1 = <div className="connector-col" key="x1">{r16s.map((m) => <Conn key={m.id} />)}</div>;
    const col2 = (
        <div className="round-col round-2-col" key="c2">
            {r16s.map((m) => <BracketMatch key={m.id} match={m} roundKey="R16" byId={byId} isEditing={isEditing} onPick={onPick} t={t} officialResults={officialResults} />)}
        </div>
    );
    const conn2 = <div className="connector-col" key="x2"><Conn /></div>;
    const col3 = (
        <div className="round-col round-3-col" key="c3">
            <BracketMatch match={qf} roundKey="QF" byId={byId} isEditing={isEditing} onPick={onPick} t={t} officialResults={officialResults} />
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
const FlatR32 = ({ r32, byId, t, officialResults }) => (
    <div className="bk-flat-r32">
        {(r32 || []).map((m) => <BracketMatch key={m.id} match={m} roundKey="R32" byId={byId} isEditing={false} onPick={() => {}} t={t} officialResults={officialResults} />)}
    </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const WorldCupBracketStage = ({ data, officialResults, totalBracketPoints, isEditable, onSave, loginBanner, cancelEditRef, onEditingChange }) => {
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
                {/* Score Summary */}
                {officialResults && !isEditing && (
                    <>
                        <BracketScoreSummary
                            bracketPredictions={working}
                            bracketResults={officialResults}
                            totalBracketPoints={totalBracketPoints || 0}
                        />
                        <BracketLegend />
                    </>
                )}
                <FlatR32 r32={working.R32} byId={byId} t={t} officialResults={officialResults} />
            </div>
        );
    }

    return (
        <div className={`bk-stage${isEditing ? ' bk-stage--editing' : ''}`}>
            {loginBanner}

            {isEditable && (
                <div className="bk-stage-header">
                    {editBtn}
                </div>
            )}

            {/* Score Summary */}
            {officialResults && !isEditing && (
                <>
                    <BracketScoreSummary
                        bracketPredictions={working}
                        bracketResults={officialResults}
                        totalBracketPoints={totalBracketPoints || 0}
                    />
                    <BracketLegend />
                </>
            )}

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
                            <QuarterCard key={qf.id} qf={qf} side="left" byId={byId} parentOf={parentOf} isEditing={isEditing} onPick={onPick} t={t} activeRound={activeRound} officialResults={officialResults} />
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
                            <QuarterCard key={qf.id} qf={qf} side="right" byId={byId} parentOf={parentOf} isEditing={isEditing} onPick={onPick} t={t} activeRound={activeRound} officialResults={officialResults} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorldCupBracketStage;
