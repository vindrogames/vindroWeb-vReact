import React from 'react';

const Calculator = ({ calcHooks, isAudioOn, siuAudio, championsAudio }) => {
    const {
        display, prevDisplay, inputDigit, performOperation,
        clear, setChampionsValue, handlePosNeg, handlePercent
    } = calcHooks;

    const onEquals = () => {
        if (isAudioOn) siuAudio.current.play();
        performOperation('=');
    };

    const onChampions = () => {
        if (isAudioOn) championsAudio.current.play();
        setChampionsValue();
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

                {[7, 8, 9].map(n => <button key={n} onClick={() => inputDigit(n)}>{n}</button>)}
                <button onClick={() => performOperation('*')} className="btn-op">×</button>

                {[4, 5, 6].map(n => <button key={n} onClick={() => inputDigit(n)}>{n}</button>)}
                <button onClick={() => performOperation('-')} className="btn-op">−</button>

                {[1, 2, 3].map(n => <button key={n} onClick={() => inputDigit(n)}>{n}</button>)}
                <button onClick={() => performOperation('+')} className="btn-op">+</button>

                <button onClick={onChampions} className="btn-special">15 🏆</button>
                <button onClick={() => inputDigit(0)}>0</button>
                <button onClick={() => inputDigit('.')}>.</button>
                <button onClick={onEquals} className="btn-equals">=</button>
            </div>
        </div>
    );
};

export default Calculator;