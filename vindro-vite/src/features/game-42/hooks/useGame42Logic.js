import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from '../../../contexts/auth/AuthContext';
import { gamescoreService } from '../../../services/gamescoreService';

// Pure: is `score`/`secs` a new personal best against existing entries?
// Ranking: higher score wins; tie broken by lower time (faster = better).
function isNewPersonalBest(score, secs, existing) {
    if (existing.length === 0) return true;
    const topScore = Math.max(...existing.map(g => g.game_score));
    if (score > topScore) return true;
    if (score === topScore) {
        const fastestAtTop = Math.min(
            ...existing
                .filter(g => g.game_score === topScore)
                .map(g => parseInt(g.game_time) || Infinity)
        );
        return secs < fastestAtTop;
    }
    return false;
}

export default function useGame42Logic() {
    const { user } = useAuth();

    const [numsRound, setNumsRound] = useState([]);
    const [numToPlace, setNumToPlace] = useState(null);
    const [numsPlaced, setNumsPlaced] = useState(Array(14).fill(0));
    const [points, setPoints] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [endCause, setEndCause] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);

    const [prevPoints, setPrevPoints] = useState(null);
    const [prevTime, setPrevTime] = useState(null);

    const [todayBestPoints, setTodayBestPoints] = useState(null);
    const [todayBestTime, setTodayBestTime] = useState(null);

    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const gameStartTimeRef = useRef(null);

    // Highscore state
    const [myGamescores, setMyGamescores] = useState([]);
    const [isNewBest, setIsNewBest] = useState(false);


    // Live elapsed time ticker during active game
    useEffect(() => {
        if (!gameStarted || gameOver) return;
        const interval = setInterval(() => {
            if (gameStartTimeRef.current) {
                setElapsedSeconds(Math.floor((Date.now() - gameStartTimeRef.current) / 1000));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [gameStarted, gameOver]);

    // Restore session values on mount
    useEffect(() => {
        try {
            const prevP = sessionStorage.getItem("game42_prevPoints");
            const prevT = sessionStorage.getItem("game42_prevTime");
            const bestP = sessionStorage.getItem("game42_todayBestPoints");
            const bestT = sessionStorage.getItem("game42_todayBestTime");

            if (prevP !== null) setPrevPoints(Number(prevP));
            if (prevT !== null) setPrevTime(Number(prevT));

            if (bestP !== null) setTodayBestPoints(Number(bestP));
            if (bestT !== null) setTodayBestTime(Number(bestT));
        } catch (e) { }
    }, []);

    // Fetch this user's game-42 scores on mount (or when auth changes)
    useEffect(() => {
        if (!user) {
            setMyGamescores([]);
            return;
        }
        gamescoreService.getMyGamescores('game-42')
            .then(res => setMyGamescores(res.data?.gamescores || []))
            .catch(() => { });
    }, [user?.id]);

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
                if (placements[l] !== 0) { leftNeighbor = placements[l]; break; }
            }
            for (let r = targetIdx + 1; r < placements.length; r++) {
                if (placements[r] !== 0) { rightNeighbor = placements[r]; break; }
            }
            return candidate > leftNeighbor && candidate < rightNeighbor;
        });
    };

    const checkPlacedNum = (placements) => {
        const active = placements.filter(n => n !== 0);
        for (let i = 0; i < active.length - 1; i++) {
            if (active[i] > active[i + 1]) return true;
        }
        return false;
    };

    /** -------- Highscore submission (fire-and-forget) -------- */

    const submitIfNewBest = async (score, secs, cause) => {
        const newBest = isNewPersonalBest(score, secs, myGamescores);
        setIsNewBest(newBest);
        if (!newBest) return;

        try {
            await gamescoreService.createGamescore({
                game_name: 'game-42',
                game_score: score,
                game_time: String(secs),
                game_metadata: { end_cause: cause },
            });
            // Refresh so the table reflects the new entry
            const res = await gamescoreService.getMyGamescores('game-42');
            setMyGamescores(res.data?.gamescores || []);
        } catch {
            // Silent — modal notification will surface this later
        }
    };

    /** -------- Actions -------- */

    const startGame = () => {
        const lastScore = sessionStorage.getItem("game42_prevPoints");
        const lastTime = sessionStorage.getItem("game42_prevTime");
        if (lastScore !== null) setPrevPoints(Number(lastScore));
        if (lastTime !== null) setPrevTime(Number(lastTime));

        const newNums = generateGameNums();
        console.log("WINNING SEQUENCE:", [...newNums].sort((a, b) => a - b));
        console.log("NUMBERS COMING UP:", newNums);

        setNumsRound(newNums.slice(1));
        setNumToPlace(newNums[0]);
        setNumsPlaced(Array(14).fill(0));
        setPoints(0);
        setGameOver(false);
        setEndCause(null);
        setElapsedSeconds(0);
        setIsNewBest(false);
        gameStartTimeRef.current = Date.now();
        setGameStarted(true);
    };

    const nextNum = (currentPlacements, currentPoints) => {
        if (numsRound.length === 0) return;

        const next = numsRound[0];
        const isPossible = checkNewNum(next, currentPlacements);

        if (!isPossible) {
            setNumToPlace(next);
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

        nextNum(updated, newPoints);
    };

    const endGame = (cause, currentPoints) => {
        const secs = gameStartTimeRef.current
            ? Math.floor((Date.now() - gameStartTimeRef.current) / 1000)
            : 0;

        setElapsedSeconds(secs);
        gameStartTimeRef.current = null;

        setGameOver(true);
        setEndCause(cause);

        sessionStorage.setItem("game42_prevPoints", String(currentPoints));
        sessionStorage.setItem("game42_prevTime", String(secs));

        if (todayBestPoints === null || currentPoints > todayBestPoints) {
            setTodayBestPoints(currentPoints);
            setTodayBestTime(secs);
            sessionStorage.setItem("game42_todayBestPoints", String(currentPoints));
            sessionStorage.setItem("game42_todayBestTime", String(secs));
        } else if (currentPoints === todayBestPoints && (todayBestTime === null || secs < todayBestTime)) {
            setTodayBestTime(secs);
            sessionStorage.setItem("game42_todayBestTime", String(secs));
        }

        if (user) {
            submitIfNewBest(currentPoints, secs, cause);
        }
    };

    // Derive personal best from DB scores for logged-in users
    const dbBest = useMemo(() => {
        if (myGamescores.length === 0) return { points: null, time: null };
        const topScore = Math.max(...myGamescores.map(g => g.game_score));
        const fastestAtTop = Math.min(
            ...myGamescores
                .filter(g => g.game_score === topScore)
                .map(g => parseInt(g.game_time) || Infinity)
        );
        return { points: topScore, time: fastestAtTop === Infinity ? null : fastestAtTop };
    }, [myGamescores]);

    const bestPoints = user ? dbBest.points : todayBestPoints;
    const bestTime = user ? dbBest.time : todayBestTime;

    const clearNewBest = () => setIsNewBest(false);

    return {
        numsPlaced, numToPlace, points, gameOver, endCause,
        gameStarted, prevPoints, prevTime,
        bestPoints, bestTime, elapsedSeconds,
        myGamescores, isNewBest, clearNewBest,
        startGame, placeNum, playAgain: startGame,
    };
}
