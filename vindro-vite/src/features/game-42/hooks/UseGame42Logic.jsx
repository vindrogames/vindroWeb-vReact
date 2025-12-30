// src/game-42/hooks/useGameLogic.js
import { useState, useEffect } from "react";
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';

export default function UseGame42Logic() {
    const { isAuthenticated, user } = useAuth();

    const [numsRound, setNumsRound] = useState([]);
    const [numToPlace, setNumToPlace] = useState(null);
    const [numsPlaced, setNumsPlaced] = useState(Array(14).fill(0));
    const [points, setPoints] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [endCause, setEndCause] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);

    const [prevPoints, setPrevPoints] = useState(null);
    const [todayBest, setTodayBest] = useState(0);

    useEffect(() => {
        try {
            const p = sessionStorage.getItem("game42_prevPoints");
            const b = sessionStorage.getItem("game42_todayBest");
            // CHANGE: We load into prevPoints on mount, 
            // but subsequent updates happen ONLY via startGame
            if (p !== null) setPrevPoints(Number(p));
            if (b !== null) setTodayBest(Number(b));
        } catch (e) {}
    }, []);

    /** -------- Game Logic Helpers -------- */

    const generateGameNums = () => {
        const nums = Array.from({ length: 42 }, (_, i) => i + 1);
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }
        return nums.slice(0, 14);
    };

    const checkNewNum = (candidate, placements) => {
        const emptyIndices = placements
            .map((val, idx) => (val === 0 ? idx : null))
            .filter((val) => val !== null);

        if (emptyIndices.length === 0) return false;

        return emptyIndices.some((targetIdx) => {
            let leftNeighbor = -Infinity;
            let rightNeighbor = Infinity;

            for (let l = targetIdx - 1; l >= 0; l--) {
                if (placements[l] !== 0) {
                    leftNeighbor = placements[l];
                    break;
                }
            }
            for (let r = targetIdx + 1; r < placements.length; r++) {
                if (placements[r] !== 0) {
                    rightNeighbor = placements[r];
                    break;
                }
            }
            return candidate > leftNeighbor && candidate < rightNeighbor;
        });
    };

    const checkPlacedNum = (placements) => {
        const active = placements.filter(n => n !== 0);
        for (let i = 0; i < active.length - 1; i++) {
            if (active[i] > active[i+1]) return true; 
        }
        return false;
    };

    /** -------- Actions -------- */

    const startGame = () => {
        // CHANGE: Update the UI with the previous game's final score ONLY when a new game starts
        const lastScore = sessionStorage.getItem("game42_prevPoints");
        if (lastScore !== null) {
            setPrevPoints(Number(lastScore));
        }

        const newNums = generateGameNums();
        setNumsRound(newNums.slice(1));
        setNumToPlace(newNums[0]);
        setNumsPlaced(Array(14).fill(0));
        setPoints(0);
        setGameOver(false);
        setEndCause(null);
        setGameStarted(true);
    };

    const nextNum = (currentPlacements, currentPoints) => {
        if (numsRound.length === 0) return;

        const next = numsRound[0];
        const isPossible = checkNewNum(next, currentPlacements);

        if (!isPossible) {
            setNumToPlace(next); 
            // CHANGE: Pass currentPoints here to ensure the points 
            // from the move just made are counted.
            endGame("no-possible-moves", currentPoints);
            return;
        }

        setNumToPlace(next);
        setNumsRound((prev) => prev.slice(1));
    };

    const placeNum = (index) => {
        if (!gameStarted || gameOver || numsPlaced[index] !== 0) return;

        const updated = [...numsPlaced];
        updated[index] = numToPlace;

        if (checkPlacedNum(updated)) {
            setNumsPlaced(updated);
            endGame("bad-placement", points);
            return;
        }

        const newPoints = points + 3;
        setNumsPlaced(updated);
        setPoints(newPoints);

        if (newPoints === 42) {
            endGame("42", newPoints);
            return;
        }

        // CHANGE: Pass the newly calculated points to nextNum 
        // to avoid waiting for the state re-render
        nextNum(updated, newPoints);
    };

    const endGame = (cause, currentPoints) => {
        setGameOver(true);
        setEndCause(cause);
        
        // CHANGE: We save to sessionStorage immediately so the data is ready,
        // but we DO NOT call setPrevPoints here. This keeps the DOM frozen.
        sessionStorage.setItem("game42_prevPoints", String(currentPoints));

        if (currentPoints > todayBest) {
            setTodayBest(currentPoints);
            sessionStorage.setItem("game42_todayBest", String(currentPoints));
        }
    };

    return {
        numsPlaced, numToPlace, points, gameOver, endCause,
        gameStarted, prevPoints, todayBest,
        startGame, placeNum, playAgain: startGame
    };
}