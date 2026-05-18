import React, { useState } from 'react';

const MEDIUM_ROUNDS = ['R32', 'R16', 'QF', 'SF'];

const MatchSlot = ({ match }) => (
    <div className="teams-container">
        <div className="team-card">{match?.home || ''}</div>
        <div className="team-card">{match?.away || ''}</div>
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

const LeftCard = ({ r32, r16, qf, activeRound, isEditable, isSwappable, id, activeEditId, onEditingChange }) => {
    const isFocused = activeEditId === id;
    const isDimmed = activeEditId && !isFocused;

    return (
        <div className={`bk-quarter-card bk-quarter-card--left ${isFocused ? 'focused-edit' : ''} ${isDimmed ? 'is-dimmed' : ''}`} data-round={activeRound}>
            {isEditable && (
                <button
                    id="bk-left"
                    className={`btn btn-tan edit-toggle-btn ${isFocused ? 'active' : ''}`}
                    onClick={() => onEditingChange(id, !isFocused)}
                >
                    {isFocused ? 'save' : 'edit'}
                </button>
            )}
            {isSwappable && !isEditable && (
                <button className="btn btn-tan edit-toggle-btn swap-btn" disabled>
                    swap
                </button>
            )}
            <div className="round-col round-1-col">
                {r32.map((m, i) => <MatchSlot key={m?.id ?? i} match={m} />)}
            </div>
            <div className="connector-col">{r32.map((_, i) => <ConnL key={i} />)}</div>
            <div className="round-col round-2-col">{r32.map((m, i) => <TeamSlot key={i} team={m?.winner} />)}</div>
            <div className="connector-col">{r16.map((_, i) => <ConnL key={i} />)}</div>
            <div className="round-col round-3-col">{r16.map((m, i) => <TeamSlot key={i} team={m?.winner} />)}</div>
            <div className="connector-col">{qf.map((_, i) => <ConnL key={i} />)}</div>
            <div className="round-col round-4-col">{qf.map((m, i) => <TeamSlot key={i} team={m?.winner} />)}</div>
        </div>
    );
};

const RightCard = ({ r32, r16, qf, activeRound, isEditable, isSwappable, id, activeEditId, onEditingChange }) => {
    const isFocused = activeEditId === id;
    const isDimmed = activeEditId && !isFocused;

    return (
        <div className={`bk-quarter-card bk-quarter-card--right ${isFocused ? 'focused-edit' : ''} ${isDimmed ? 'is-dimmed' : ''}`} data-round={activeRound}>
            {isEditable && (
                <button
                    id="bk-right"
                    className={`btn btn-tan edit-toggle-btn ${isFocused ? 'active' : ''}`}
                    onClick={() => onEditingChange(id, !isFocused)}
                >
                    {isFocused ? 'save' : 'edit'}
                </button>
            )}
            {isSwappable && !isEditable && (
                <button className="btn btn-tan edit-toggle-btn swap-btn" disabled>
                    swap
                </button>
            )}
            <div className="round-col round-4-col">{qf.map((m, i) => <TeamSlot key={i} team={m?.winner} />)}</div>
            <div className="connector-col">{qf.map((_, i) => <ConnR key={i} />)}</div>
            <div className="round-col round-3-col">{r16.map((m, i) => <TeamSlot key={i} team={m?.winner} />)}</div>
            <div className="connector-col">{r16.map((_, i) => <ConnR key={i} />)}</div>
            <div className="round-col round-2-col">{r32.map((m, i) => <TeamSlot key={i} team={m?.winner} />)}</div>
            <div className="connector-col">{r32.map((_, i) => <ConnR key={i} />)}</div>
            <div className="round-col round-1-col">{r32.map((m, i) => <MatchSlot key={m?.id ?? i} match={m} />)}</div>
        </div>
    );
};

const WorldCupBracketStage = ({ data, activeEditId, onEditingChange, isEditable, isSwappable }) => {
    const [activeRound, setActiveRound] = useState('R32');
    const [activeSection, setActiveSection] = useState('left');

    const r32 = data?.R32 ?? [];
    const r16 = data?.R16 ?? [];
    const qf = data?.QF ?? [];
    const sf = data?.SF ?? [];
    const trd = data?.['3rd'] ?? [];

    const isFinalsFocused = activeEditId === 'bk-finals';
    const isFinalsDimmed = activeEditId && !isFinalsFocused;

    return (
        <div className="bk-stage">
            <div className="bk-stage-container">
                <div className="bk-half-toggle">
                    <button className={`bk-tab ${activeSection === 'left' ? ' bk-tab--active' : ''}`} onClick={() => setActiveSection('left')}>Left</button>
                    <button className={`bk-tab ${activeSection === 'center' ? ' bk-tab--active' : ''}`} onClick={() => setActiveSection('center')}>Finals</button>
                    <button className={`bk-tab ${activeSection === 'right' ? ' bk-tab--active' : ''}`} onClick={() => setActiveSection('right')}>Right</button>
                </div>
                {/* const MEDIUM_ROUNDS = ['R32', 'R16', 'QF', 'SF']; */}

                <div className={`bk-medium-tabs ${activeSection == 'center' ? `is-dimmed` : ''} ${activeSection !== 'center' ? `is-${activeSection}` : ''}`}>
                    <button className={`bk-tab ${activeRound === 'R32' ? 'bk-tab--active' : ''}`} onClick={() => setActiveRound('R32')}>R32</button>
                    <button className={`bk-tab ${activeRound === 'R16' ? 'bk-tab--active' : ''}`} onClick={() => setActiveRound('R16')}>R16</button>
                    <button className={`bk-tab ${activeRound === 'QF' ? 'bk-tab--active' : ''}`} onClick={() => setActiveRound('QF')}>QF</button>
                    <button className={`bk-tab ${activeRound === 'SF' ? 'bk-tab--active' : ''}`} onClick={() => setActiveRound('SF')}>SF</button>
                </div>

                <div className="bk-tree" data-section={activeSection}>
                    <div className="bk-bracket-half bk-bracket-half--left">
                        <LeftCard
                            id="bk-left-top"
                            activeEditId={activeEditId}
                            onEditingChange={onEditingChange}
                            r32={r32.slice(0, 4)} r16={r16.slice(0, 2)} qf={qf.slice(0, 1)}
                            activeRound={activeRound} isEditable={isEditable} isSwappable={isSwappable}
                        />
                        <LeftCard
                            id="bk-left-bottom"
                            activeEditId={activeEditId}
                            onEditingChange={onEditingChange}
                            r32={r32.slice(4, 8)} r16={r16.slice(2, 4)} qf={qf.slice(1, 2)}
                            activeRound={activeRound} isEditable={isEditable} isSwappable={isSwappable}
                        />
                    </div>

                    <div className={`bk-center${isFinalsDimmed ? ' is-dimmed' : ''}`}>
                        <div className="connector-col"><div className="rounds-connect-container"><div className="two-lines"><div className="line" /><div className="line" /></div><div className="center-vertical" /><div className="one-line"><div className="line" /></div></div></div>

                        <div className={`round-col round-col-finals${isFinalsFocused ? ' focused-edit' : ''}`}>
                            {isEditable && (
                                <button
                                    id="bk-finals"
                                    className={`btn btn-tan edit-toggle-btn ${isFinalsFocused ? 'active' : ''}`}
                                    onClick={() => onEditingChange('bk-finals', !isFinalsFocused)}
                                >
                                    {isFinalsFocused ? 'save' : 'edit'}
                                </button>
                            )}
                            {isSwappable && !isEditable && (
                                <button className="btn btn-tan edit-toggle-btn swap-btn" disabled>
                                    swap
                                </button>
                            )}
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
                        <RightCard
                            id="bk-right-top"
                            activeEditId={activeEditId}
                            onEditingChange={onEditingChange}
                            r32={r32.slice(8, 12)} r16={r16.slice(4, 6)} qf={qf.slice(2, 3)}
                            activeRound={activeRound} isEditable={isEditable} isSwappable={isSwappable}
                        />
                        <RightCard
                            id="bk-right-bottom"
                            activeEditId={activeEditId}
                            onEditingChange={onEditingChange}
                            r32={r32.slice(12, 16)} r16={r16.slice(6, 8)} qf={qf.slice(3, 4)}
                            activeRound={activeRound} isEditable={isEditable} isSwappable={isSwappable}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorldCupBracketStage;
