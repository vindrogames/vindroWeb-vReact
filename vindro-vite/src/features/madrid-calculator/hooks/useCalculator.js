import { useState } from 'react';

/**
 * Custom hook for Madrid Calculator logic.
 * Handles digits, operations, and Real Madrid specific features.
 */
export default function useCalculator() {
    const [display, setDisplay] = useState('0');
    const [prevDisplay, setPrevDisplay] = useState('');
    const [data, setData] = useState({
        firstOperand: null,
        operator: null,
        waitingForSecond: false
    });

    const DECIMAL_NUMBERS = 3;

    const clear = () => {
        setDisplay('0');
        setPrevDisplay('');
        setData({ firstOperand: null, operator: null, waitingForSecond: false });
    };

    const inputDigit = (digit) => {
        if (data.waitingForSecond) {
            setDisplay(String(digit));
            setData(prev => ({ ...prev, waitingForSecond: false }));
        } else {
            // Prevent multiple leading zeros or multiple decimals
            if (digit === '.' && display.includes('.')) return;
            setDisplay(display === '0' && digit !== '.' ? String(digit) : display + digit);
        }
    };

    const handlePosNeg = () => {
        setDisplay(String(parseFloat(display) * -1));
    };

    const handlePercent = () => {
        const current = parseFloat(display);
        if (isNaN(current)) return;
        setDisplay(String(current / 100));
    };

    // The special "15" logic
    const setChampionsValue = () => {
        setDisplay('15');
        if (data.waitingForSecond) {
            setData(prev => ({ ...prev, waitingForSecond: false }));
        }
    };

    const performOperation = (nextOperator) => {
        const inputValue = parseFloat(display);

        if (data.firstOperand === null) {
            setData(prev => ({ ...prev, firstOperand: inputValue }));
        } else if (data.operator) {
            const result = calculate(data.firstOperand, inputValue, data.operator);
            
            // Format the "previous result" line like your original script
            const symbol = getSymbol(data.operator);
            setPrevDisplay(`${data.firstOperand} ${symbol} ${inputValue} =`);
            
            setDisplay(String(result));
            setData(prev => ({ ...prev, firstOperand: result }));
        }

        setData(prev => ({ 
            ...prev, 
            waitingForSecond: true, 
            operator: nextOperator === '=' ? null : nextOperator 
        }));
    };

    const calculate = (num1, num2, op) => {
        let res;
        switch (op) {
            case '+': res = num1 + num2; break;
            case '-': res = num1 - num2; break;
            case '*': res = num1 * num2; break;
            case '/': res = num1 / num2; break;
            default: return num2;
        }
        // Rounding to 3 decimals as per your DECIMAL_NUMBERS constant
        return parseFloat(res.toFixed(DECIMAL_NUMBERS));
    };

    const getSymbol = (op) => {
        const symbols = { '+': '\u002B', '-': '\u2212', '*': '\u00D7', '/': '\u00F7' };
        return symbols[op] || '';
    };

    return { 
        display, 
        prevDisplay, 
        inputDigit, 
        performOperation, 
        clear, 
        setChampionsValue,
        handlePosNeg,
        handlePercent
    };
}