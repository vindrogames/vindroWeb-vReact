// Calculator.jsx Component
import React from 'react';
import { FaTrophy, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const Calculator = ({
    calcHooks,
    championsAudio,
    isChampionsAudioOn,
    onToggleChampionsAudio,
    siuAudio,
    isSiuAudioOn,
    onToggleSiuAudio
}) => {
    const {
        display, prevDisplay, inputDigit, performOperation,
        clear, setChampionsValue, handlePosNeg, handlePercent
    } = calcHooks;

    const onEquals = () => {
        if (isSiuAudioOn) siuAudio.current.play();
        performOperation('=');
    };

    const onChampions = () => {
        // 1. Play the audio if enabled
        if (isChampionsAudioOn && championsAudio.current) {
            championsAudio.current.currentTime = 0;
            championsAudio.current.play().catch(err => console.log("Audio blocked", err));
        }

        // 2. Logic: If there is a pending operation, act as an "equals"
        if (prevDisplay) {
            // Set the second operand to 15
            inputDigit(15);
            // Immediately execute the calculation
            performOperation('=');
        } else {
            // If it's the start of a sequence, just set the value to 15
            setChampionsValue();
        }
    };

    return (
        <div className="calculator-body">
            <div className="calc-screen">
                <div className="screen-prev">{prevDisplay}</div>
                <div className="screen-main">{display}</div>
            </div>

            <div className="calc-grid">
                <button onClick={clear} className="btn-util">AC</button>
                <button onClick={handlePosNeg} className="btn-util">+/-</button>
                <button onClick={handlePercent} className="btn-util">%</button>
                <button onClick={() => performOperation('/')} className="btn-op">÷</button>

                {[7, 8, 9].map(n => <button key={n} className="num" onClick={() => inputDigit(n)}>{n}</button>)}
                <button onClick={() => performOperation('*')} className="btn-op">×</button>

                {[4, 5, 6].map(n => <button key={n} className="num" onClick={() => inputDigit(n)}>{n}</button>)}
                <button onClick={() => performOperation('-')} className="btn-op">−</button>

                {[1, 2, 3].map(n => <button key={n} className="num" onClick={() => inputDigit(n)}>{n}</button>)}
                <button onClick={() => performOperation('+')} className="btn-op">+</button>

                <button className="num" onClick={() => inputDigit(0)}>0</button>
                <button className="comma" onClick={() => inputDigit('.')}>.</button>

                <button onClick={onChampions} className="btn-champions"><FaTrophy /><p>15</p></button>
                <button className="equals" onClick={onEquals}>=</button>

                <div className='empty'></div>
                <div className='empty'></div>
                <div className='audio-btn-container'>
                    <button
                        id="champions-audio"
                        className={`audio-btn ${isChampionsAudioOn ? '' : 'off'}`}
                        onClick={onToggleChampionsAudio}
                    >
                        <FaVolumeUp className="icon-on" />
                        <FaVolumeMute className="icon-off" />
                    </button>
                </div>

                <div className='audio-btn-container'>
                    <button
                        id="siuuu-audio"
                        className={`audio-btn ${isSiuAudioOn ? '' : 'off'}`}
                        onClick={onToggleSiuAudio}
                    >
                        <FaVolumeUp className="icon-on" />
                        <FaVolumeMute className="icon-off" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Calculator;