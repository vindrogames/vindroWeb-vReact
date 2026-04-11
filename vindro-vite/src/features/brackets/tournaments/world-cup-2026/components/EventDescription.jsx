

const EventDescription = () => {

    return (
        <section id="about-tournament" className="about-tournament">

            <div className="about-tournament-container">
                <div className="feature">

                    <div className="feature-text-container">
                        <div className="feature-title">
                            <p className="feature-icon">📊</p><h4>Groups Stage</h4>
                        </div>

                        <div className="feature-explanation">
                            <p>Predict the precise final ranking (1st-4th) for all 48 teams in their respective groups. You gain 1 point for each position placed correctly.</p>
                            <p>Achieving a perfect 48/48 record awards a crucial +2 point bonus, for a maximum possible 50-point bank.</p>
                            <p>Points banked here act as a strategic currency for future swaps during the Bracket Stage.</p>
                        </div>
                    </div>

                    <div className="feature-table">
                        <div className="table-container">
                            <table id="groups-points-table">
                                <thead>
                                    <tr>
                                        <th>Metric</th>
                                        <th>Pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Correct Placement</td>
                                        <td>1</td>
                                    </tr>
                                    <tr>
                                        <td>Total Placements (12 Groups x 4)</td>
                                        <td>48</td>
                                    </tr>
                                    <tr>
                                        <td>Perfect Groups Bonus</td>
                                        <td>+2</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Max Bankable Points</strong></td>
                                        <td><strong>50</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
                <div className="feature">

                    <div className="feature-text-container">
                        <div className="feature-title">
                            <p className="feature-icon">🏆</p><h4>Bracket Stage</h4>
                        </div>

                        <div className="feature-explanation">
                            <p>A clean, fresh bracket is provided after the Group stage is complete so you can predict all winners from the Round of 32 through to the Champion.</p>
                            <p>This knockout structure is standard elimination, but with a unique twist. Depending on your results from the Group phase, you will have the ability to course-correct when needed!</p>
                            <p>Points increase in value each subsequent round: 2 - 4 - 8 - 16 - 32, ensuring a dramatic and competitive finish.</p>
                        </div>
                    </div>

                    <div className="feature-table">
                        <div className="table-container">
                            <table id="bracket-points-table">
                                <thead>
                                    <tr>
                                        <th>Round</th>
                                        <th>Games</th>
                                        <th>Pts</th>
                                        <th>Max</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Round of 32</td>
                                        <td>16</td>
                                        <td>2</td>
                                        <td>32</td>
                                    </tr>
                                    <tr>
                                        <td>Round of 16</td>
                                        <td>8</td>
                                        <td>4</td>
                                        <td>32</td>
                                    </tr>
                                    <tr>
                                        <td>Quarter-finals</td>
                                        <td>4</td>
                                        <td>8</td>
                                        <td>32</td>
                                    </tr>
                                    <tr>
                                        <td>Semi-finals</td>
                                        <td>2</td>
                                        <td>16</td>
                                        <td>32</td>
                                    </tr>
                                    <tr>
                                        <td>Final</td>
                                        <td>1</td>
                                        <td>32</td>
                                        <td>32</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3"><strong>Total Bracket Potential</strong></td>
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
                            <p className="feature-icon">⭐</p><h4>Swapping</h4>
                        </div>

                        <div className="feature-explanation">
                            <p>In the event that one of your predictions is eliminated, you can activate your accumulated Group points to modify the path they were projected to win.</p>
                            <p>How it works: You aren’t fixing the past (round 32 or round 16); you are buying a replacement guess for that team's future matches (Round of 8 and onward).</p>
                            <p>Swaps only correct the path moving forward. They do not award missing points retrospectively.</p>
                            <p>The cost to make a swap increases in a strict Fibonacci sequence, making each subsequent correction exponentially more expensive: 3, 5, 8, 13, 21.</p>
                        </div>
                    </div>


                    <div className="feature-table">
                        <div className="table-container">
                            <table id="swap-table">
                                <thead>
                                    <tr>
                                        <th>Swap nº</th>
                                        <th>Cost</th>
                                        <th>Points Spent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1st Swap</td>
                                        <td>3</td>
                                        <td>3</td>
                                    </tr>
                                    <tr>
                                        <td>2nd Swap</td>
                                        <td>5</td>
                                        <td>8</td>
                                    </tr>
                                    <tr>
                                        <td>3rd Swap</td>
                                        <td>8</td>
                                        <td>16</td>
                                    </tr>
                                    <tr>
                                        <td>4th Swap</td>
                                        <td>13</td>
                                        <td>29</td>
                                    </tr>
                                    <tr>
                                        <td>5th Swap</td>
                                        <td>21</td>
                                        <td>50</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>

            </div>
        </section>

    )

}

export default EventDescription;