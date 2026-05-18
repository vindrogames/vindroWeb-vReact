import { useTranslation } from 'react-i18next';

const SLUG = 'world-cup-2026';

const EventDescription = () => {
    const { t } = useTranslation('tournament');
    const k = (key) => `${SLUG}.about.${key}`;

    return (
        <section id="about-tournament" className="about-tournament">
            <div className="about-tournament-container">

                <div className="feature">
                    <div className="feature-text-container">
                        <div className="feature-title">
                            <p className="feature-icon">📊</p><h4>{t(k('groupsTitle'))}</h4>
                        </div>
                        <div className="feature-explanation">
                            <p>{t(k('groupsP1'))}</p>
                            <p>{t(k('groupsP2'))}</p>
                            <p>{t(k('groupsP3'))}</p>
                        </div>
                    </div>
                    <div className="tournament-feature-table">
                        <div className="table-container bg-gray backdrop-tan">
                            <table id="groups-points-table">
                                <thead>
                                    <tr>
                                        <th>{t(k('groupsColPrediction'))}</th>
                                        <th>Pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>{t(k('groupsRowPlacement'))}</td><td>1</td></tr>
                                    <tr><td>{t(k('groupsRowTotal'))}</td><td>48</td></tr>
                                    <tr><td>{t(k('groupsRowBonus'))}</td><td>+2</td></tr>
                                    <tr><td><strong>{t(k('groupsRowMax'))}</strong></td><td><strong>50</strong></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="feature">
                    <div className="feature-text-container">
                        <div className="feature-title">
                            <p className="feature-icon">🏆</p><h4>{t(k('bracketTitle'))}</h4>
                        </div>
                        <div className="feature-explanation">
                            <p>{t(k('bracketP1'))}</p>
                            <p>{t(k('bracketP2'))}</p>
                            <p>{t(k('bracketP3'))}</p>
                        </div>
                    </div>
                    <div className="tournament-feature-table">
                        <div className="table-container bg-gray backdrop-tan">
                            <table id="bracket-points-table">
                                <thead>
                                    <tr>
                                        <th>{t(k('bracketColRound'))}</th>
                                        <th>{t(k('bracketColGames'))}</th>
                                        <th>Pts</th>
                                        <th>Max</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>{t(k('bracketRound32'))}</td><td>16</td><td>2</td><td>32</td></tr>
                                    <tr><td>{t(k('bracketRound16'))}</td><td>8</td><td>4</td><td>32</td></tr>
                                    <tr><td>{t(k('bracketQF'))}</td><td>4</td><td>8</td><td>32</td></tr>
                                    <tr><td>{t(k('bracketSF'))}</td><td>2</td><td>16</td><td>32</td></tr>
                                    <tr><td>{t(k('bracketFinal'))}</td><td>1</td><td>32</td><td>32</td></tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3"><strong>{t(k('bracketTotal'))}</strong></td>
                                        <td><strong>160</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="feature">
                    <div className="feature-text-container">
                        <div className="feature-title">
                            <p className="feature-icon">⭐</p><h4>{t(k('swapTitle'))}</h4>
                        </div>
                        <div className="feature-explanation">
                            <p>{t(k('swapP1'))}</p>
                            <p>{t(k('swapP2'))}</p>
                            <p>{t(k('swapP3'))}</p>
                            <p>{t(k('swapP4'))}</p>
                        </div>
                    </div>
                    <div className="tournament-feature-table">
                        <div className="table-container bg-gray backdrop-tan">
                            <table id="swap-table">
                                <thead>
                                    <tr>
                                        <th>{t(k('swapColNº'))}</th>
                                        <th>{t(k('swapColCost'))}</th>
                                        <th>{t(k('swapColSpent'))}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>{t(k('swap1'))}</td><td>3</td><td>3</td></tr>
                                    <tr><td>{t(k('swap2'))}</td><td>5</td><td>8</td></tr>
                                    <tr><td>{t(k('swap3'))}</td><td>8</td><td>16</td></tr>
                                    <tr><td>{t(k('swap4'))}</td><td>13</td><td>29</td></tr>
                                    <tr><td>{t(k('swap5'))}</td><td>21</td><td>50</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default EventDescription;
