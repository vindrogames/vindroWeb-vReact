import { useState } from 'react';

export default function useCalculator() {
    const [display, setDisplay] = useState('0');
    const [prevDisplay, setPrevDisplay] = useState('');
    const [data, setData] = useState({
        firstOperand: null,      // Keep as string for large numbers
        operator: null,
        waitingForSecond: false
    });

    const DECIMAL_NUMBERS = 3;
    const MAX_OPERAND_CHARS = 16;

    const getSymbol = (op) => {
        const symbols = { '+': '\u002B', '-': '\u2212', '*': '\u00D7', '/': '\u00F7' };
        return symbols[op] || '';
    };

    const formatNumberForDisplay = (num) => {
        if (typeof num !== 'number') return String(num);
        
        if (num === 0) return '0';
        if (!isFinite(num)) return '0';
        
        if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
            let str;
            if (Math.abs(num) >= 1e15) {
                if (num % 1 === 0) {
                    str = num.toFixed(0);
                } else {
                    str = num.toFixed(DECIMAL_NUMBERS);
                }
            } else {
                str = num.toFixed(DECIMAL_NUMBERS);
            }
            str = str.replace(/(\.\d*[1-9])0+$|\.0+$/, '$1');
            return str;
        }
        
        if (num % 1 !== 0) {
            const formatted = parseFloat(num.toFixed(DECIMAL_NUMBERS));
            return formatted.toString();
        }
        
        return num.toString();
    };

    const calculate = (num1Str, num2Str, op) => {
        const num1 = parseFloat(num1Str);
        const num2 = parseFloat(num2Str);
        
        let res;
        switch (op) {
            case '+': res = num1 + num2; break;
            case '-': res = num1 - num2; break;
            case '*': res = num1 * num2; break;
            case '/': res = num2 !== 0 ? num1 / num2 : 0; break;
            default: return num2Str;
        }
        
        // Only round the result of the calculation, not the operands
        return parseFloat(res.toFixed(DECIMAL_NUMBERS));
    };

    const clear = () => {
        setDisplay('0');
        setPrevDisplay('');
        setData({ firstOperand: null, operator: null, waitingForSecond: false });
    };

    const inputDigit = (digit) => {
        const symbol = data.operator ? getSymbol(data.operator) : '';

        if (data.operator && data.waitingForSecond) {
            setDisplay(`${data.firstOperand} ${symbol} ${digit}`);
            setData(prev => ({ ...prev, waitingForSecond: false }));
        } else if (data.operator) {
            const parts = display.split(` ${symbol} `);
            const currentSecond = parts[1] || '';

            if (currentSecond.length >= MAX_OPERAND_CHARS) return;

            const newSecond = currentSecond === '0' ? String(digit) : currentSecond + digit;
            setDisplay(`${data.firstOperand} ${symbol} ${newSecond}`);
        } else {
            if (display.length >= MAX_OPERAND_CHARS) return;

            if (digit === '.' && display.includes('.')) return;
            setDisplay(display === '0' && digit !== '.' ? String(digit) : display + digit);
        }
    };

    const performOperation = (nextOperator) => {
        let secondValue;
        const symbol = data.operator ? getSymbol(data.operator) : '';

        if (data.operator) {
            const parts = display.split(` ${symbol} `);
            secondValue = parts[1]; // Keep as string
        } else {
            secondValue = display; // Keep as string
        }

        if (data.firstOperand === null) {
            if (nextOperator === '=') return;
            // Store the string representation
            setData({ firstOperand: secondValue, operator: nextOperator, waitingForSecond: true });
            setDisplay(`${secondValue} ${getSymbol(nextOperator)}`);
        } else if (data.operator) {
            if (secondValue && !isNaN(parseFloat(secondValue))) {
                const result = calculate(data.firstOperand, secondValue, data.operator);
                const formattedResult = formatNumberForDisplay(result);
                setPrevDisplay(`${data.firstOperand} ${symbol} ${secondValue} = ${formattedResult}`);

                if (nextOperator === '=') {
                    setDisplay(formattedResult);
                    setData({ firstOperand: formattedResult, operator: null, waitingForSecond: false });
                } else {
                    // Store result as string for next operation
                    setDisplay(`${result} ${getSymbol(nextOperator)}`);
                    setData({ firstOperand: String(result), operator: nextOperator, waitingForSecond: true });
                }
            } else {
                setData(prev => ({ ...prev, operator: nextOperator }));
                setDisplay(`${data.firstOperand} ${getSymbol(nextOperator)}`);
            }
        } else if (nextOperator !== '=') {
            setData({ firstOperand: secondValue, operator: nextOperator, waitingForSecond: true });
            setDisplay(`${secondValue} ${getSymbol(nextOperator)}`);
        }
    };

    const setChampionsValue = () => {
        const value = '15';
        if (data.operator) {
            const symbol = getSymbol(data.operator);
            const result = calculate(data.firstOperand, value, data.operator);
            const formattedResult = formatNumberForDisplay(result);
            setPrevDisplay(`${data.firstOperand} ${symbol} ${value} = ${formattedResult}`);
            setDisplay(formattedResult);
            setData({ firstOperand: formattedResult, operator: null, waitingForSecond: false });
        } else {
            setDisplay('15');
            setData({ firstOperand: null, operator: null, waitingForSecond: false });
        }
    };

    const handlePosNeg = () => {
        if (data.operator) {
            const symbol = getSymbol(data.operator);
            const parts = display.split(` ${symbol} `);
            if (parts[1]) {
                const toggled = String(parseFloat(parts[1]) * -1);
                setDisplay(`${data.firstOperand} ${symbol} ${toggled}`);
            }
        } else {
            setDisplay(String(parseFloat(display) * -1));
        }
    };

    const handlePercent = () => {
        if (data.operator) {
            const symbol = getSymbol(data.operator);
            const parts = display.split(` ${symbol} `);
            if (parts[1]) {
                const percentVal = String(parseFloat(parts[1]) / 100);
                setDisplay(`${data.firstOperand} ${symbol} ${percentVal}`);
            }
        } else {
            setDisplay(String(parseFloat(display) / 100));
        }
    };

    return {
        display, prevDisplay, inputDigit, performOperation,
        clear, setChampionsValue, handlePosNeg, handlePercent
    };
}