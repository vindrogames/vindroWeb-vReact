import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const renderTeam = (team, t) => {
    if (!team) return null;
    if (typeof team === 'object') {
        return (
            <>
                <img src={`/img/vindro-flags/${team.flag}.webp`} alt="" className="bk-team-flag" />
                <span className="bk-team-name">{t(team.name)}</span>
            </>
        );
    }
    return team;
};

const MatchSlot = ({ match, t }) => (
    <div className="teams-container">
        <div className={`team-card${!match?.home ? ' team-card--empty' : ''}`}>{renderTeam(match?.home, t)}</div>
        <div className={`team-card${!match?.away ? ' team-card--empty' : ''}`}>{renderTeam(match?.away, t)}</div>
    </div>
);

const TeamSlot = ({ team }) => (
    <div className="teams-container">
        <div className={`team-card${!team ? ' team-card--empty' : ''}`}>{team || ''}</div>
    </div>
);

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

const LeftCard = ({ r32, r16, qf, t, activeRound }) => (
    <div className="bk-quarter-card bk-quarter-card--left" data-round={activeRound}>
        <div className="round-col round-1-col">
            {r32.map((m, i) => <MatchSlot key={m?.id ?? i} match={m} t={t} />)}
        </div>
        <div className="connector-col">{r32.map((_, i) => <ConnL key={i} />)}</div>
        <div className="round-col round-2-col">{r32.map((_, i) => <TeamSlot key={i} team={_.winner} />)}</div>
        <div className="connector-col">{r16.map((_, i) => <ConnL key={i} />)}</div>
        <div className="round-col round-3-col">{r16.map((m, i) => <TeamSlot key={i} team={m?.winner} />)}</div>
        <div className="connector-col">{qf.map((_, i) => <ConnL key={i} />)}</div>
        <div className="round-col round-4-col">{qf.map((m, i) => <TeamSlot key={i} team={m?.winner} />)}</div>
    </div>
);

const RightCard = ({ r32, r16, qf, t, activeRound }) => (
    <div className="bk-quarter-card bk-quarter-card--right" data-round={activeRound}>
        <div className="round-col round-4-col">{qf.map((m, i) => <TeamSlot key={i} team={m?.winner} />)}</div>
        <div className="connector-col">{qf.map((_, i) => <ConnR key={i} />)}</div>
        <div className="round-col round-3-col">{r16.map((m, i) => <TeamSlot key={i} team={m?.winner} />)}</div>
        <div className="connector-col">{r16.map((_, i) => <ConnR key={i} />)}</div>
        <div className="round-col round-2-col">{r32.map((_, i) => <TeamSlot key={i} team={_.winner} />)}</div>
        <div className="connector-col">{r32.map((_, i) => <ConnR key={i} />)}</div>
        <div className="round-col round-1-col">{r32.map((m, i) => <MatchSlot key={m?.id ?? i} match={m} t={t} />)}</div>
    </div>
);

const WorldCupBracketStage = ({ data, isEditable, onSave, loginBanner, cancelEditRef, onEditingChange }) => {
    const { t } = useTranslation('tournament');
    const [activeSection, setActiveSection] = useState('left');
    const [activeRound, setActiveRound] = useState('R32');
    const [isEditing, setIsEditing] = useState(false);

    const r32 = data?.R32 ?? [];
    const r16 = data?.R16 ?? [];
    const qf = data?.QF ?? [];
    const sf = data?.SF ?? [];
    const trd = data?.['3rd'] ?? [];

    useEffect(() => {
        if (!cancelEditRef) return;
        cancelEditRef.current = () => {
            setIsEditing(false);
            onEditingChange?.('bk-editing', false);
        };
    });

    const startEditing = () => {
        setIsEditing(true);
        onEditingChange?.('bk-editing', true);
    };

    const handleSave = async () => {
        if (typeof onSave === 'function') {
            try {
                await onSave(data);
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

    return (
        <div className={`bk-stage${isEditing ? ' bk-stage--editing' : ''}`}>

            {isEditable && (
                <button
                    className={`btn gallery-edit-btn${isEditing ? ' active' : ''}`}
                    onClick={isEditing ? handleSave : startEditing}
                >
                    {isEditing ? 'save' : 'edit bracket'}
                </button>
            )}

            {loginBanner}

            <div className="bk-stage-container">
                <div className="bk-half-toggle">
                    <button className={`bk-tab${activeSection === 'left' ? ' bk-tab--active' : ''}`} onClick={() => setActiveSection('left')}>Left</button>
                    <button className={`bk-tab${activeSection === 'center' ? ' bk-tab--active' : ''}`} onClick={() => setActiveSection('center')}>Finals</button>
                    <button className={`bk-tab${activeSection === 'right' ? ' bk-tab--active' : ''}`} onClick={() => setActiveSection('right')}>Right</button>
                </div>

                <div className="bk-medium-tabs">
                    {['R32', 'R16', 'QF', 'SF'].map(round => (
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
                        <LeftCard r32={r32.slice(0, 4)} r16={r16.slice(0, 2)} qf={qf.slice(0, 1)} t={t} activeRound={activeRound} />
                        <LeftCard r32={r32.slice(4, 8)} r16={r16.slice(2, 4)} qf={qf.slice(1, 2)} t={t} activeRound={activeRound} />
                    </div>

                    <div className="bk-center">
                        <div className="connector-col"><div className="rounds-connect-container"><div className="two-lines"><div className="line" /><div className="line" /></div><div className="center-vertical" /><div className="one-line"><div className="line" /></div></div></div>

                        <div className="round-col round-col-finals">
                            <div className="teams-container">
                                <h6>Finals</h6>
                                <div className={`team-card${!sf[0]?.winner ? ' team-card--empty' : ''}`}>{sf[0]?.winner || ''}</div>
                                <div className={`team-card${!sf[1]?.winner ? ' team-card--empty' : ''}`}>{sf[1]?.winner || ''}</div>
                            </div>
                            <div className="teams-container teams-1-4">
                                <h6>Top 4</h6>
                                <div className={`team-card${!qf[0]?.winner ? ' team-card--empty' : ''}`}>{qf[0]?.winner || ''}</div>
                                <div className={`team-card${!qf[1]?.winner ? ' team-card--empty' : ''}`}>{qf[1]?.winner || ''}</div>
                                <div className={`team-card${!qf[2]?.winner ? ' team-card--empty' : ''}`}>{qf[2]?.winner || ''}</div>
                                <div className={`team-card${!qf[3]?.winner ? ' team-card--empty' : ''}`}>{qf[3]?.winner || ''}</div>
                            </div>
                            <div className="teams-container">
                                <h6>Runners up</h6>
                                <div className={`team-card${!trd[0]?.home ? ' team-card--empty' : ''}`}>{trd[0]?.home || ''}</div>
                                <div className={`team-card${!trd[0]?.away ? ' team-card--empty' : ''}`}>{trd[0]?.away || ''}</div>
                            </div>
                        </div>

                        <div className="connector-col"><div className="rounds-connect-container"><div className="one-line"><div className="line" /></div><div className="center-vertical" /><div className="two-lines"><div className="line" /><div className="line" /></div></div></div>
                    </div>

                    <div className="bk-bracket-half bk-bracket-half--right">
                        <RightCard r32={r32.slice(8, 12)} r16={r16.slice(4, 6)} qf={qf.slice(2, 3)} t={t} activeRound={activeRound} />
                        <RightCard r32={r32.slice(12, 16)} r16={r16.slice(6, 8)} qf={qf.slice(3, 4)} t={t} activeRound={activeRound} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorldCupBracketStage;
