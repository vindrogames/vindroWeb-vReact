// src/game-42/hooks/useGameLogic.js
import { useState, useRef, useEffect } from "react";

export default function UseGame42Logic() {

    const [numsRound, setNumsRound] = useState([]);
    const [numToPlace, setNumToPlace] = useState(null);
    const [numsPlaced, setNumsPlaced] = useState(Array(14).fill(0));
    const [points, setPoints] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [endCause, setEndCause] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);

    // New: previous run and today's best (persisted in session)
    const [prevPoints, setPrevPoints] = useState(null);
    const [todayBest, setTodayBest] = useState(0);

    useEffect(() => {
        try {
            const p = sessionStorage.getItem("game42_prevPoints");
            const b = sessionStorage.getItem("game42_todayBest");
            if (p !== null) setPrevPoints(Number(p));
            if (b !== null) setTodayBest(Number(b));
        } catch (e) {
            // ignore storage errors
        }
    }, []);

    /** -------- Utilities -------- */
    const generateGameNums = () => {
        const nums = Array.from({ length: 42 }, (_, i) => i + 1);
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }
        return nums.slice(0, 14);
    };

    /** -------- Game Logic -------- */

    const startGame = () => {
        const newNums = generateGameNums();
        setNumsRound(newNums.slice(1));
        setNumToPlace(newNums[0]);
        setNumsPlaced(Array(14).fill(0));
        setPoints(0);
        setGameOver(false);
        setEndCause(null);
        setGameStarted(true);
    };

    const checkPlacedNum = (placements) => {
        const numsToCheck = placements.filter((num) => num !== 0);
        for (let i = 0; i < numsToCheck.length; i++) {
            if (numsToCheck[i] > numsToCheck[i + 1]) return true;
        }
        return false;
    };

    const checkNewNum = (candidate, placements) => {
        const numsToCheck = placements.filter((n) => n !== 0);
        if (numsToCheck.length > 1) {
            for (let i = 0; i < placements.length; i++) {
                if (placements[i] === 0) continue;
                if (placements[i] > candidate) return false;
            }
        }
        return false;
    };

    const nextNum = () => {
        if (!numsRound.length) return;
        const next = numsRound[0];
        setNumToPlace(next);
        setNumsRound((prev) => prev.slice(1));
    };

    const placeNum = (index) => {
        if (!gameStarted || gameOver || numsPlaced[index] !== 0) return;

        const updated = [...numsPlaced];
        updated[index] = numToPlace;
        const bad = checkPlacedNum(updated);

        if (bad) {
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

        nextNum();
    };

    const endGame = (cause, currentPoints = points) => {
        setGameOver(true);
        setEndCause(cause);

        // record previous points and today's best (use sessionStorage)
        try {
            const finished = currentPoints;
            setPrevPoints(finished);
            sessionStorage.setItem("game42_prevPoints", String(finished));

            const newBest = Math.max(todayBest || 0, finished);
            setTodayBest(newBest);
            sessionStorage.setItem("game42_todayBest", String(newBest));
        } catch (e) {
            // ignore storage errors
        }
    };

    const playAgain = () => {
        startGame();
    };

    return {
        // State
        numsPlaced,
        numToPlace,
        points,
        gameOver,
        endCause,
        gameStarted,
        prevPoints,
        todayBest,
        // Actions
        startGame,
        placeNum,
        playAgain,
    };
}
