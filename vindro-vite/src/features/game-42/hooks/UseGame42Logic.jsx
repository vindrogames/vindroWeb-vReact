// src/game-42/hooks/useGameLogic.js
import { useState, useEffect } from "react";

export default function UseGame42Logic() {
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

    // This logic simulates every possible move. 
    // If NO empty slot can hold the candidate without breaking the order, return false.
    const checkNewNum = (candidate, placements) => {
        const emptyIndices = placements
            .map((val, idx) => (val === 0 ? idx : null))
            .filter((val) => val !== null);

        // If no empty spots left, game over logic handles it elsewhere, but return false safely.
        if (emptyIndices.length === 0) return false;

        // .some() returns true as soon as it finds ONE valid spot.
        return emptyIndices.some((targetIdx) => {
            // Find the closest filled numbers to the left and right
            let leftNeighbor = -Infinity;
            let rightNeighbor = Infinity;

            // Look left
            for (let l = targetIdx - 1; l >= 0; l--) {
                if (placements[l] !== 0) {
                    leftNeighbor = placements[l];
                    break;
                }
            }
            // Look right
            for (let r = targetIdx + 1; r < placements.length; r++) {
                if (placements[r] !== 0) {
                    rightNeighbor = placements[r];
                    break;
                }
            }

            // The move is valid if: Left < Candidate < Right
            return candidate > leftNeighbor && candidate < rightNeighbor;
        });
    };

    const checkPlacedNum = (placements) => {
        const active = placements.filter(n => n !== 0);
        for (let i = 0; i < active.length - 1; i++) {
            if (active[i] > active[i+1]) return true; // Bad order
        }
        return false;
    };

    /** -------- Actions -------- */

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

    const nextNum = (currentPlacements) => {
        if (numsRound.length === 0) return;

        const next = numsRound[0];
        const isPossible = checkNewNum(next, currentPlacements);

        if (!isPossible) {
            setNumToPlace(next); // Keep the 'killing' number visible
            endGame("no-possible-moves", points);
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

        nextNum(updated);
    };

    const endGame = (cause, currentPoints) => {
        setGameOver(true);
        setEndCause(cause);
        setPrevPoints(currentPoints);
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