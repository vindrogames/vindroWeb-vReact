import React, { useMemo } from 'react';
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
        display, 
        prevDisplay, 
        inputDigit, 
        performOperation, 
        clear, 
        setChampionsValue, 
        handlePosNeg, 
        handlePercent 
    } = calcHooks;

    // Calculate dynamic font size based on display length
    const screenMainFontSize = useMemo(() => {
        const baseSize = 4.2; // rem
        const charCount = display.length;
        
        // Scale down progressively: base size - (0.25 * chars over 11)
        if (charCount <= 11) return baseSize;
        const scaledSize = Math.max(2.0, baseSize - ((charCount - 11) * 0.25));
        return scaledSize;
    }, [display]);

    const handleEquals = () => {
        if (isSiuAudioOn && siuAudio.current) {
            siuAudio.current.currentTime = 0;
            siuAudio.current.play().catch(() => {});
        }
        performOperation('=');
    };

    const handleChampions = () => {
        if (isChampionsAudioOn && championsAudio.current) {
            championsAudio.current.currentTime = 0;
            championsAudio.current.play().catch(() => {});
        }
        setChampionsValue();
    };

    return (
        <div className="calculator-body">
            <div className="calc-screen">
                <div className="screen-prev-wrapper">
                    <div key={prevDisplay} className="screen-prev animate">
                        {prevDisplay || '\u00A0'}
                    </div>
                </div>
                <div class="screen-main" style={{ fontSize: `${screenMainFontSize}rem` }}>
                    {display}
                </div>
            </div>

            <div className="calc-grid">
                <button onClick={clear} className="btn-util">AC</button>
                <button onClick={handlePosNeg} className="btn-util">+/-</button>
                <button onClick={handlePercent} className="btn-util">%</button>
                <button onClick={() => performOperation('/')} className="btn-op">÷</button>

                {[7, 8, 9].map(n => (
                    <button key={n} className="num" onClick={() => inputDigit(n)}>{n}</button>
                ))}
                <button onClick={() => performOperation('*')} className="btn-op">×</button>

                {[4, 5, 6].map(n => (
                    <button key={n} className="num" onClick={() => inputDigit(n)}>{n}</button>
                ))}
                <button onClick={() => performOperation('-')} className="btn-op">−</button>

                {[1, 2, 3].map(n => (
                    <button key={n} className="num" onClick={() => inputDigit(n)}>{n}</button>
                ))}
                <button onClick={() => performOperation('+')} className="btn-op">+</button>

                <button className="num" onClick={() => inputDigit(0)}>0</button>
                <button className="comma" onClick={() => inputDigit('.')}>.</button>
                <button onClick={handleChampions} className="btn-champions">
                    <FaTrophy /><p>15</p>
                </button>
                <button className="equals" onClick={handleEquals}>=</button>

                <div className='empty'></div><div className='empty'></div>
                
                <div className='audio-btn-container'>
                    <button id="champions-audio" className={`audio-btn ${isChampionsAudioOn ? '' : 'off'}`} onClick={onToggleChampionsAudio}>
                        <FaVolumeUp className="icon-on" />
                        <FaVolumeMute className="icon-off" />
                    </button>
                </div>
                <div className='audio-btn-container'>
                    <button id="siuuu-audio" className={`audio-btn ${isSiuAudioOn ? '' : 'off'}`} onClick={onToggleSiuAudio}>
                        <FaVolumeUp className="icon-on" />
                        <FaVolumeMute className="icon-off" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Calculator;