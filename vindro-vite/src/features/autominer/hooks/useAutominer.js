import { useState, useEffect } from 'react';

export default function useAutominer() {

    // 1. Core Resource State
    const [resources, setResources] = useState({
        iron: 0,
        sulfur: 0,
        drills: 0,
        silver: 0
    });

    // 2. Worker/Automation State
    const [workers, setWorkers] = useState({
        iron: 0,
        silver: 0
    });

    // 3. Automation Settings (Auto-buy toggles and rates)
    const [autoBuyActive, setAutoBuyActive] = useState({
        sulfur: false,
        drills: false
    });

    const [autoBuyRates, setAutoBuyRates] = useState({
        sulfur: 0,
        drills: 0
    });

    // 4. Progress state for the 5-click Silver mechanic
    const [silverClickProgress, setSilverClickProgress] = useState(0);

    // --- HELPER LOGIC ---

    // Calculates price for a single worker based on current count
    const getSingleWorkerCost = (base, currentCount) => {
        return base + Math.floor(currentCount / 10);
    };

    // Calculates the SUM cost for buying multiple workers at once
    const getBulkWorkerCost = (base, currentCount, amountToBuy) => {
        let total = 0;
        for (let i = 0; i < amountToBuy; i++) {
            total += getSingleWorkerCost(base, currentCount + i);
        }
        return total;
    };

    // --- ACTIONS ---

    const mineIron = () => {
        setResources(prev => ({ ...prev, iron: prev.iron + 1 }));
    };

    const buySulfur = () => {
        setResources(prev => ({ ...prev, sulfur: prev.sulfur + 1, iron: prev.iron - 50 }))
    };

    const buyDrill = () => {
        setResources(prev => ({ ...prev, drills: prev.drills + 1, iron: prev.iron - 500 }))
    };

    const manualSilverClick = () => {
        const sulfurCostPerStep = 2;
        const drillCostFinalStep = 1;

        if (resources.sulfur < sulfurCostPerStep) return;

        // Logic: If progress is already 5 (full), the next click is actually "Click 1" of the new bar
        const currentProgress = silverClickProgress;

        if (currentProgress === 4) {
            if (resources.drills >= drillCostFinalStep) {
                // We've hit the end! Give the reward.
                setResources(prev => ({
                    ...prev,
                    sulfur: prev.sulfur - sulfurCostPerStep,
                    drills: prev.drills - drillCostFinalStep,
                    silver: prev.silver + 1
                }));
                // Move progress to 5 so the bar looks full
                setSilverClickProgress(5);
            }
        } else if (currentProgress === 5) {
            // The bar was full, now we start a fresh one (this is Click 1)
            setSilverClickProgress(1);
            setResources(prev => ({
                ...prev,
                sulfur: prev.sulfur - sulfurCostPerStep
            }));
        } else {
            // Normal steps 1, 2, 3
            setSilverClickProgress(prev => prev + 1);
            setResources(prev => ({
                ...prev,
                sulfur: prev.sulfur - sulfurCostPerStep
            }));
        }
    };

    const buyWorkers = (type, amount) => {
        const base = 10;
        const currency = type === 'iron' ? 'iron' : 'silver';

        // Get the price of the next single unit
        const currentSingleCost = getSingleWorkerCost(base, workers[type]);

        // Use simple multiplication so it matches the UI (e.g., 41 * 5 = 205)
        const totalCost = currentSingleCost * amount;

        if (resources[currency] >= totalCost) {
            setResources(prev => ({
                ...prev,
                [currency]: prev[currency] - totalCost
            }));
            setWorkers(prev => ({
                ...prev,
                [type]: prev[type] + amount
            }));
        }
    };

    // --- THE GAME LOOP (Ticker) ---
    useEffect(() => {
        const interval = setInterval(() => {
            setResources(prev => {
                let nextIron = prev.iron + workers.iron;
                let nextSulfur = prev.sulfur;
                let nextDrills = prev.drills;
                let nextSilver = prev.silver + workers.silver;

                // AUTOMATION HIERARCHY
                // 1. Priority: Drills (500 Iron each)
                if (autoBuyActive.drills) {
                    const drillCost = autoBuyRates.drills * 500;
                    if (nextIron >= drillCost) {
                        nextIron -= drillCost;
                        nextDrills += autoBuyRates.drills;
                    }
                }

                // 2. Next: Sulfur (50 Iron each)
                if (autoBuyActive.sulfur) {
                    const sulfurCost = autoBuyRates.sulfur * 50;
                    if (nextIron >= sulfurCost) {
                        nextIron -= sulfurCost;
                        nextSulfur += autoBuyRates.sulfur;
                    }
                }

                return {
                    ...prev,
                    iron: nextIron,
                    sulfur: nextSulfur,
                    drills: nextDrills,
                    silver: nextSilver
                };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [workers, autoBuyActive, autoBuyRates]);

    return {
        resources,
        workers,
        autoBuyActive,
        setAutoBuyActive,
        autoBuyRates,
        setAutoBuyRates,
        silverClickProgress,
        // Methods
        mineIron,
        buySulfur,
        buyDrill,
        manualSilverClick,
        buyWorkers,
        // Cost Getters for UI display
        getSingleWorkerCost,
        getIronWorkerCost: (qty) => getBulkWorkerCost(10, workers.iron, qty),
        getSilverWorkerCost: (qty) => getBulkWorkerCost(10, workers.silver, qty)
    };
};