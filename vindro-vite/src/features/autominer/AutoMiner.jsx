// /features/autominer/Autominer.jsx
import React, { useState, useEffect } from 'react';
import AutominerHelmet from '../../page-helmets/AutominerHelmet'
import useAutominer from './hooks/useAutominer'
import ResourceBar from './components/ResourceBar';
import AutominerInstructions from './components/AutominerInstructions'
import { FaCaretUp, FaCaretDown } from "react-icons/fa";


const Autominer = () => {

    // 1. UI State for Modals
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
    const [visualProgress, setVisualProgress] = useState(0);

    // 2. NEW: Updated buyQtys structure for clarity
    const [buyQtys, setBuyQtys] = useState({
        ironMiners: 1,
        sulfur: 1,
        drills: 1,
        silverMiners: 1
    });

    // 3. Initialize Game Engine
    const game = useAutominer();

    // 4. Sync UI Quantities to Engine (Crucial for AutoBuy logic)
    useEffect(() => {
        game.setAutoBuyRates({
            sulfur: buyQtys.sulfur,
            drills: buyQtys.drills
        });
    }, [buyQtys.sulfur, buyQtys.drills]);

    // 5. UI Helpers
    const handleAdjust = (key, amount) => {
        setBuyQtys(prev => ({
            ...prev,
            [key]: Math.max(1, prev[key] + amount)
        }));
    };

    // Derived costs for Iron Miners (using the bulk formula from hook)
    const currentIronWorkerCost = game.getIronWorkerCost(buyQtys.ironMiners);
    const currentSilverWorkerCost = game.getSilverWorkerCost(buyQtys.silverMiners);

    // This gets the cost of the VERY NEXT miner (e.g., 41)
    const currentSingleIronWorkerPrice = game.getIronWorkerCost(1);
    const currentSingleSilverWorkerPrice = game.getSilverWorkerCost(1);

    // This creates the simple display math you want (41 * 5 = 205)
    const displayTotalIronWorkerCost = currentSingleIronWorkerPrice * buyQtys.ironMiners;
    const displayTotalSilverWorkerCost = currentSingleSilverWorkerPrice * buyQtys.silverMiners;

    // Watch the game engine: sync visual progress with real progress
    useEffect(() => {
        // Update visual bar immediately
        setVisualProgress(game.silverClickProgress);

        // If game hits 5 (complete), wait 600ms then reset visual bar to 0
        if (game.silverClickProgress === 5) {
            const timer = setTimeout(() => {
                setVisualProgress(0);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [game.silverClickProgress]);

    const formatResource = (num) => {
        if (num >= 1000000) {
            return Math.floor(num / 100000) / 10 + 'M'; // 1,250,000 -> 1.2M
        }
        if (num >= 1000) {
            return Math.floor(num / 100) / 10 + 'K'; // 24,786 -> 24.7K
        }
        return num; // Under 1000 stays as is
    };

    return (

        <>
        <AutominerHelmet />

        <main id="auto-miner">

            <div className="auto-miner-container">

                <section id="game-intro">

                    <ResourceBar resources={game.resources} />

                    <h1>auto<span className="inline-teal inline-bold">Miner</span></h1>

                    <div className="sub-header-text-instruct">

                        <h2>An idle game</h2>
                        {/* <h2>Automate the mining, leave tab open and reach the maximum</h2> */}

                        <button
                            type="button"
                            id="how-to-play"
                            className="btn btn-green"
                            onClick={() => setIsInstructionsOpen(true)}
                            aria-label="Autominer Instructions Toggle Button"
                        >
                            How To Play
                        </button>
                    </div>


                </section>

                <section id="iron" className='resource-section'>

                    <div id="iron-mining-section" className="resource-section-grid">
                        <div className="grid-cell-container">
                            <div className="grid-cell-content">

                                <div className="header-text">
                                    <img src="/img/beam.webp" alt="Iron Beam Vindrogames Autominer"></img>
                                    <h3>Iron Mining</h3>
                                </div>

                                <button
                                    type="button"
                                    id="buy-iron-btn"
                                    className="auto-miner-btn"
                                    onClick={game.mineIron}
                                    aria-label="Mine 1 iron"
                                >
                                    Click to mine 1 Iron
                                </button>
                            </div>
                        </div>

                        <div id="total-iron-grid-display" className="grid-cell-container">
                            <div className="grid-cell-content total-grid-cell-content">
                                <div className="total-resource-grid-display">
                                    <h4>Total Iron </h4>
                                    <div className="total-resource-display">{formatResource(game.resources.iron)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="iron-automation-section" className="resource-section-grid">
                        <div className="grid-cell-container">
                            <div id="iron-automation" className="grid-cell-content">

                                <div className="header-text">
                                    <h3>🤖 Automate Iron Mining</h3>
                                </div>

                                <div className="cost-purchase-display">
                                    <p>1 Miner costs</p>
                                    <div id="iron-miner-inline-cost" className="inline-cost-display">{game.getIronWorkerCost(1)}</div>
                                </div>

                                <div className="purchase-section">

                                    <p>Nº to AutoBuy: </p>
                                    <div className="plus-minus-purchase-display">

                                        <div id="num-iron-miners-purchase-display" className='inline-cost-display'>{buyQtys.ironMiners}</div>
                                        <div className="plus-minus-purchase-buttons">

                                            <button
                                                type="button"
                                                className="plus-1-purchase-btn"
                                                onClick={() => handleAdjust('ironMiners', 1)}
                                                aria-label="Increase iron miner quantity"
                                            >
                                                <FaCaretUp />
                                            </button>
                                            <button
                                                type="button"
                                                className="minus-1-purchase-btn"
                                                onClick={() => handleAdjust('ironMiners', -1)}
                                                aria-label="Decrease iron miner quantity"
                                            >
                                                <FaCaretDown />
                                            </button>

                                        </div>
                                    </div>
                                </div>

                                <div className="purchase-summary-section">
                                    <p>Total cost:</p>
                                    <div id="iron-miner-inline-cost" className="inline-cost-display">{displayTotalIronWorkerCost}</div>
                                    <p>Iron</p>
                                </div>
                                <button
                                    type="button"
                                    className="auto-miner-btn"
                                    disabled={game.resources.iron < currentIronWorkerCost}
                                    onClick={() => game.buyWorkers('iron', buyQtys.ironMiners)}
                                    aria-label="Buy Iron Miners Button"
                                >
                                    ⛏️Click to buy {buyQtys.ironMiners} {buyQtys.ironMiners > 1 ? `miners` : 'miner'}
                                </button>
                            </div>
                        </div>

                        <div className="grid-cell-container">
                            <div className="grid-cell-content total-grid-cell-content">
                                <div className="total-resource-grid-display">
                                    <h4>Iron Miners</h4>
                                    <div id="total-iron-grid-display" className="total-resource-display">{game.workers.iron}</div>
                                </div>
                                <div className="total-resource-grid-display production-cost-display">
                                    <div className="production-cost-heading">
                                        <h4>Production</h4>
                                        <img src="/img/beam.webp" alt="Iron Beam icon Vindrogames Autominer" />
                                        <h4>/s</h4>
                                    </div>
                                    <div id="iron-production-grid-display" className="production-display">{game.workers.iron}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </section >

                <section id="sulfur" className='resource-section'>
                    <div id="sulfur-buying-section" className="resource-section-grid">
                        <div className="grid-cell-container">
                            <div className="grid-cell-content">

                                <div className="header-text">
                                    <img src="/img/sulfur.webp" alt="Sulfer icon Vindrogames Autominer game"></img>
                                    <h3>Sulfur Buying Station</h3>
                                </div>

                                <div id="sulfur-purchase-display" className="cost-purchase-display">
                                    <p>1 Sulfur costs</p>
                                    <div id="sulfur-buy-inline-cost" className="inline-cost-display">50</div>
                                    <p>Iron</p>
                                </div>

                                <button
                                    id="buy-sulfur-btn"
                                    className="auto-miner-btn"
                                    disabled={game.resources.iron < 50}
                                    onClick={() => {
                                        if (game.resources.iron >= 50) {
                                            game.buySulfur()
                                        }
                                    }}
                                >
                                    Click to buy 1 Sulfur
                                </button>
                            </div>
                        </div>

                        <div className="grid-cell-container">
                            <div className="grid-cell-content">
                                <div className="total-resource-grid-display">
                                    <h4>Total Sulfur</h4>
                                    <div id="total-sulfur-grid-display" className="total-resource-display">{formatResource(game.resources.sulfur)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="sulfur-automation-section" className="resource-section-grid">
                        <div className="grid-cell-container">
                            <div id="sulfur-automation" className="grid-cell-content">

                                <label>
                                    <input
                                        type="checkbox"
                                        // Same logic: disable ONLY if they can't afford it AND it's not already on
                                        disabled={game.resources.iron < (buyQtys.sulfur * 50) && !game.autoBuyActive.sulfur}
                                        checked={game.autoBuyActive.sulfur}
                                        onChange={(e) => game.setAutoBuyActive(prev => ({ ...prev, sulfur: e.target.checked }))}
                                    />
                                    AutoBuy Sulfur
                                </label>

                                <div className="purchase-section">

                                    <p>Nº to AutoBuy: </p>
                                    <div className="plus-minus-purchase-display">

                                        <div id="num-sulfur-purchase-display" className='inline-cost-display'>{buyQtys.sulfur}</div>
                                        <div className="plus-minus-purchase-buttons">

                                            <button
                                                type="button"
                                                className="plus-1-purchase-btn"
                                                onClick={() => handleAdjust('sulfur', 1)}
                                                aria-label="Increase sulfur quantity"
                                            >
                                                <FaCaretUp />
                                            </button>
                                            <button
                                                type="button"
                                                className="minus-1-purchase-btn"
                                                onClick={() => handleAdjust('sulfur', -1)}
                                                aria-label="Decrease sulfur quantity"
                                            >
                                                <FaCaretDown />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid-cell-container">
                            <div className="grid-cell-content">
                                <div id="sulfur-production-cost" className="total-resource-grid-display production-cost-display">
                                    <div className="production-cost-heading">
                                        <h4>AutoBuy</h4>
                                        <img src="/img/sulfur.webp" alt="Iron Beam icon Vindrogames Autominer" />
                                        <h4>Cost</h4>
                                    </div>
                                    <div id="sulfur-production-grid-display" className="production-display">{buyQtys.sulfur * 50}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="drills" className='resource-section'>
                    <div id="drills-buying-section" className="resource-section-grid">
                        <div className="grid-cell-container">
                            <div className="grid-cell-content">

                                <div className="header-text">
                                    <img src="/img/drill.webp" alt="Drill icon Vindrogames Autominer game"></img>
                                    <h3>Drill Buying Station</h3>
                                </div>

                                <div id="drills-purchase-display" className="cost-purchase-display">
                                    <p>1 Drill costs</p>
                                    <div id="drills-inline-cost" className="inline-cost-display">500</div>
                                    <p>Iron</p>
                                </div>

                                <button
                                    id="buy-drills-btn"
                                    className="auto-miner-btn"
                                    disabled={game.resources.iron < 500}
                                    onClick={() => {
                                        if (game.resources.iron >= 500) {
                                            game.buyDrill()
                                        }
                                    }}
                                >
                                    Click to buy 1 Drill
                                </button>
                            </div>
                        </div>

                        <div className="grid-cell-container">
                            <div className="grid-cell-content">
                                <div className="total-resource-grid-display">
                                    <h4>Total Drills</h4>
                                    <div id="total-drills-grid-display" className="total-resource-display">{game.resources.drills}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="drills-automation-section" className="resource-section-grid">
                        <div className="grid-cell-container">
                            <div id="drills-automation" className="grid-cell-content">

                                <label>
                                    <input
                                        type="checkbox"
                                        // Same logic: disable ONLY if they can't afford it AND it's not already on
                                        disabled={game.resources.iron < (buyQtys.drills * 500) && !game.autoBuyActive.drills}
                                        checked={game.autoBuyActive.drills}
                                        onChange={(e) => game.setAutoBuyActive(prev => ({ ...prev, drills: e.target.checked }))}
                                    />
                                    AutoBuy Drills
                                </label>

                                <div className="purchase-section">

                                    <p>Nº to AutoBuy: </p>
                                    <div className="plus-minus-purchase-display">

                                        <div id="num-drills-purchase-display" className='inline-cost-display'>{buyQtys.drills}</div>
                                        <div className="plus-minus-purchase-buttons">

                                            <button
                                                type="button"
                                                className="plus-1-purchase-btn"
                                                onClick={() => handleAdjust('drills', 1)}
                                                aria-label="Increase sulfur quantity"
                                            >
                                                <FaCaretUp />
                                            </button>
                                            <button
                                                type="button"
                                                className="minus-1-purchase-btn"
                                                onClick={() => handleAdjust('drills', -1)}
                                                aria-label="Decrease sulfur quantity"
                                            >
                                                <FaCaretDown />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid-cell-container">
                            <div className="grid-cell-content">
                                <div id="drills-production-cost" className="total-resource-grid-display production-cost-display">
                                    <div className="production-cost-heading">
                                        <h4>AutoBuy</h4>
                                        <img src="/img/drill.webp" alt="Iron Beam icon Vindrogames Autominer" />
                                        <h4>Cost</h4>
                                    </div>
                                    <div id="drills-production-grid-display" className="production-display">{buyQtys.drills * 500}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="silver" className='resource-section'>

                    <div id="silver-mining-section" className="resource-section-grid">
                        <div className="grid-cell-container">
                            <div className="grid-cell-content">

                                <div className="header-text">
                                    <img src="/img/silver.webp" alt="ISilver icon Vindrogames Autominer"></img>
                                    <h3>Silver Mining</h3>
                                </div>

                                <div id="silver-purchase-display" className="cost-purchase-display">
                                    <p>Requires</p>
                                    <div id="silver-sulfur-buy-inline-cost" className="inline-cost-display">10</div>
                                    <img src="/img/sulfur.webp" alt="" />
                                    <p>and</p>
                                    <div id="silver-drill-buy-inline-cost" className="inline-cost-display">1</div>
                                    <img src="/img/drill.webp" alt="" />
                                </div>

                                <button
                                    type="button"
                                    id="buy-silver-btn"
                                    className="auto-miner-btn"
                                    // Explicitly disable based on the current step's needs
                                    disabled={
                                        game.resources.sulfur < 2 ||
                                        (game.silverClickProgress === 4 && game.resources.drills < 1)
                                    }
                                    onClick={game.manualSilverClick}
                                >
                                    Click 5 times to mine 1 Silver
                                </button>

                                <div className="silver-progress-container">
                                    <progress
                                        id="silver-progress"
                                        className="progress is-small"
                                        // Use the local visual state here
                                        value={visualProgress}
                                        max="5"
                                    >
                                        {Math.round((visualProgress / 5) * 100)}%
                                    </progress>

                                    <div className="progress-end-nums">
                                        <span>0</span>
                                        <span>5</span>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="grid-cell-container">
                            <div className="grid-cell-content">
                                <div className="total-resource-grid-display">
                                    <h4>Total Silver</h4>
                                    <div id="total-silver-grid-display" className="total-resource-display">{game.resources.silver}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="silver-automation-section" className="resource-section-grid">
                        <div className="grid-cell-container">
                            <div id="silver-automation" className="grid-cell-content">

                                <div className="header-text">
                                    <h3>🤖 Automate Silver Mining</h3>
                                </div>

                                <div className="cost-purchase-display">
                                    <p>1 Miner costs</p>
                                    <div id="silver-miner-inline-cost" className="inline-cost-display">{game.getSilverWorkerCost(1)}</div>
                                    <p>Silver</p>
                                </div>

                                <div className="purchase-section">

                                    <p>Nº to AutoBuy: </p>
                                    <div className="plus-minus-purchase-display">

                                        <div id="num-silver-miners-purchase-display" className='inline-cost-display'>{buyQtys.silverMiners}</div>
                                        <div className="plus-minus-purchase-buttons">

                                            <button
                                                type="button"
                                                className="plus-1-purchase-btn"
                                                onClick={() => handleAdjust('silverMiners', 1)}
                                                aria-label="Increase silver miner quantity"
                                            >
                                                <FaCaretUp />
                                            </button>
                                            <button
                                                type="button"
                                                className="minus-1-purchase-btn"
                                                onClick={() => handleAdjust('silverMiners', -1)}
                                                aria-label="Decrease silver miner quantity"
                                            >
                                                <FaCaretDown />
                                            </button>

                                        </div>
                                    </div>
                                </div>

                                <div className="purchase-summary-section">
                                    <p>Total cost:</p>
                                    <div id="silver-miner-inline-cost" className="inline-cost-display">{displayTotalSilverWorkerCost}</div>
                                    <p>Silver</p>
                                </div>
                                <button
                                    type="button"
                                    className="auto-miner-btn"
                                    disabled={game.resources.silver < currentSilverWorkerCost}
                                    onClick={() => game.buyWorkers('silver', buyQtys.silverMiners)}
                                    aria-label="Buy Silver Miners Button"
                                >
                                    ⛏️Click to buy {buyQtys.silverMiners} {buyQtys.silverMiners > 1 ? `miners` : 'miner'}
                                </button>
                            </div>
                        </div>

                        <div className="grid-cell-container">
                            <div className="grid-cell-content total-grid-cell-content">
                                <div className="total-resource-grid-display">
                                    <h4>Silver Miners</h4>
                                    <div id="total-silver-grid-display" className="total-resource-display">{game.workers.silver}</div>
                                </div>
                                <div className="total-resource-grid-display production-cost-display">
                                    <div className="production-cost-heading">
                                        <h4>Production</h4>
                                        <img src="/img/silver.webp" alt="Iron Beam icon Vindrogames Autominer" />
                                        <h4>/s</h4>
                                    </div>
                                    <div id="iron-production-grid-display" className="production-display">{game.workers.silver}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </section >

                {/* The Full-Screen Instructions Modal */}
                <AutominerInstructions
                    gameStarted={game.resources.iron > 0 ? true : false}
                    isOpen={isInstructionsOpen}
                    onClose={() => setIsInstructionsOpen(false)}
                />
            </div >
        </main >
        </>
    );
};

export default Autominer;