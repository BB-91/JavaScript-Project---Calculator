import * as Algorithm from './lib/algorithm.js';

const calcScreenTop = document.querySelector("calc-screen-top");
const calcScreenBottom = document.querySelector("calc-screen-bottom");
let negationInsertionStr = "";
let lastAnswer = "";

const setEnabled = (element, bool) => {
    if (!element) {throw new Error(`Element is null`);}
    if (bool) {element.classList.remove("disabled");}
    else {element.classList.add("disabled");}
}

const setRequired = (element, bool) => {
    if (!element) {throw new Error(`Element is null`);}
    if (bool) {element.classList.add("required");}
    else {element.classList.remove("required");}
}

const getLastNumStr = () => {
    let lastNumChars = [];
    const bottomText = calcScreenBottom.textContent;
    for (let i = bottomText.length - 1; i >= 0; i--) {
        const char = bottomText.charAt(i);
        if (/[\-\.0-9]/g.test(char)) {
            lastNumChars.unshift(char);
        } else {
            break;
        }
    }
    return lastNumChars.join('');
}


let openingParenthesesCount = 0;
let closingParenthesesCount = 0;
let equalsBtn = null;
let closingParenthesesBtn = null;
let _isAwaitingRightOperand = false;
const setIsAwaitingRightOperand = (bool) => {
    if (typeof bool != "boolean") {throw new Error(`Not a boolean: ${bool}`);}
    _isAwaitingRightOperand = bool;
    setEnabled(closingParenthesesBtn, !bool && (openingParenthesesCount > closingParenthesesCount));
}

let _isAwaitingContentInParentheses = false;
const setIsAwaitingContentInParentheses = (bool) => {
    if (typeof bool != "boolean") {throw new Error(`Not a boolean: ${bool}`);}
    _isAwaitingContentInParentheses = bool;
    setEnabled(closingParenthesesBtn, !bool && !_isAwaitingRightOperand);
}

const updateParenthesesCounts = () => {
    openingParenthesesCount = Algorithm.strCount(calcScreenBottom.textContent + calcScreenTop.textContent, "(");
    closingParenthesesCount = Algorithm.strCount(calcScreenBottom.textContent + calcScreenTop, ")");
    const hasMatchingParentheses = openingParenthesesCount == closingParenthesesCount;
    setEnabled(equalsBtn, hasMatchingParentheses && !_isAwaitingRightOperand);
    setRequired(closingParenthesesBtn, !hasMatchingParentheses);
}


let currentBtnLayerIndex = 0;
let layeredBtns = [ // assigned in setup()
    // sinBtn
    // cosBTn
    // tanBtn
    // logBtn
];
const layeredBtnsText = [
    ["sin", "asin", "sinh"],
    ["cos", "acos", "cosh"],
    ["tan", "atan", "tanh"],
    ["log", "log2", "log10"],
];

const BtnDict = { // populate DOM in setup()
	'abs': {suffix: 'abs',},
	'+/-': {suffix: 'neg',},

	'ceil': {suffix: 'ceil',},
	'floor': {suffix: 'floor',},
	'round': {suffix: 'round',},
	'trunc': {suffix: 'trunc',},

	'√': {suffix: 'sqrt',},
	'∛': {suffix: 'cbrt',},
	'^': {suffix: 'pow',},
	'Ans': {suffix: 'answer',},

	'sin': {suffix: 'sin',},
	'cos': {suffix: 'cos',},
	'tan': {suffix: 'tan',},
	'FUNC': {suffix: 'func',},

	'log': {suffix: 'log',},
	'sign': {suffix: 'sign',},
	'(': {suffix: 'open',},
	')': {suffix: 'close',},

	'AC': {suffix: 'clear-all',},
	'C': {suffix: 'clear',},
	'Del': {suffix: 'del',},

	'/': {suffix: 'divide',},
	'×': {suffix: 'multiply',},
	'-': {suffix: 'subtract',},
	'+': {suffix: 'add',},

	'0': {suffix: '0',},
	'1': {suffix: '1',},
	'2': {suffix: '2',},
	'3': {suffix: '3',},
	'4': {suffix: '4',},
	'5': {suffix: '5',},
	'6': {suffix: '6',},
	'7': {suffix: '7',},
	'8': {suffix: '8',},
	'9': {suffix: '9',},

	'.': {suffix: 'decimal',},
	'=': {suffix: 'sum',},
}

const getLastChar = (str) => {
    if (typeof str != "string"){
        throw new Error(`Not a string: ${str}`)
    } else {
        return str.charAt(str.length - 1);
    }
}

const getLastTop = () => {
    return getLastChar(calcScreenTop.textContent.trim());
}

const backspace = () => {
    const bottomText = calcScreenBottom.textContent;
    if (bottomText) {
        calcScreenBottom.textContent = bottomText.slice(0, -1);
        negationInsertionStr = negationInsertionStr.slice(0, -1);
    }
}

const processBtnPress = (btn, simulated) => {
    const btnTextContent = btn.textContent;
    const topText = calcScreenTop.textContent;
    const bottomText = calcScreenBottom.textContent;

    if (btn.textContent == "(") {
        negationInsertionStr = "(";
    } else if (isNaN(negationInsertionStr) && !isNaN(btnTextContent)) {
        negationInsertionStr = btnTextContent;
    } else if (!isNaN(negationInsertionStr + btnTextContent)) {
        negationInsertionStr += btnTextContent;
    } else if (Algorithm.MATH_FUNC_NAMES.includes(btnTextContent)) {
        negationInsertionStr = btnTextContent;
    }

    let str = "";

    if (simulated) {
        btn.classList.add("simulated-click");
    }

    if (!isNaN(btnTextContent)) {
        setIsAwaitingRightOperand(false);
        setIsAwaitingContentInParentheses(false);
    }

    if (_isAwaitingContentInParentheses
            && (Algorithm.MATH_FUNC_NAMES.includes(btnTextContent) || !isNaN(btnTextContent))
                && !bottomText.trim().endsWith("(")){
        setIsAwaitingContentInParentheses(false);
    }

    switch (btnTextContent){
        case "(":
            setIsAwaitingContentInParentheses(true);
            str = "(";
            break;
        case ")":
            if (_isAwaitingRightOperand) {
                return;
            }

            if (openingParenthesesCount > closingParenthesesCount) {
                str = ")";
            }
            break;
        case "+":
        case "-":
        case "×":
        case "/":
            if (!_isAwaitingRightOperand && !_isAwaitingContentInParentheses) {
                str = btnTextContent;
                setIsAwaitingRightOperand(true);
                setEnabled(equalsBtn, false);
            }
            break;
        case "+/-":
            let temp = calcScreenBottom.textContent;
            if (negationInsertionStr && temp) {
                const insertionIndex = temp.lastIndexOf(negationInsertionStr);
                if (insertionIndex == -1) {
                    return;
                }

                let arr = temp.split('');
                const tempChars = temp.split('');

                if (temp.charAt(insertionIndex) == "-") {
                    if (!negationInsertionStr.startsWith("-")) {
                        throw new Error(`Expected negationInsertionStr to begin with negative sign: ${negationInsertionStr}`)
                    }

                    negationInsertionStr = negationInsertionStr.slice(1);
                    arr.splice(insertionIndex, 1);
                } else {
                    arr.splice(Math.max(insertionIndex), 0, "-");
                    negationInsertionStr = "-" + negationInsertionStr;
                }


                str = arr.join('');
                if (str) {
                    try {
                        calcScreenBottom.textContent = Algorithm.getFormattedEquationStr(str);
                    } catch(error) {
                        calcScreenBottom.textContent = "ERROR";
                        console.log(error);
                    }
                }
                return;
            }
            break;
        case '√':
            if (bottomText) {
                str = `^(1/2)`;
            }
            break;
        case '∛':
            if (bottomText) {
                str = `^(1/3)`;
            }
            break;
        case "Ans":
            str = lastAnswer;
            break;
        case "AC":
            calcScreenTop.textContent = "";
            calcScreenBottom.textContent = "";
            negationInsertionStr = "";
            break;
        case "C":
            negationInsertionStr = "";
            calcScreenBottom.textContent = "";
            break;
        case "Del":
            backspace();
            break;
        case "FUNC":
            currentBtnLayerIndex = (currentBtnLayerIndex + 1) % 3
            for (let i = 0; i < 4; i++) {
                const layeredBtn = layeredBtns[i];
                const newText = layeredBtnsText[i][currentBtnLayerIndex];
                layeredBtn.textContent = newText;
            }
            break;
        case ".":
            const lastNumStr = getLastNumStr();
            if (!lastNumStr) {
                str = "0.";
            } else if (lastNumStr.includes(".")) {
                str = "";
            } else {
                str = ".";
            }
            break;
        case "=":
            if (openingParenthesesCount != closingParenthesesCount) {
                return;
            }

            const equationStr = topText + bottomText;
            const formattedEquationStr = Algorithm.getFormattedEquationStr(equationStr);
            
            try {
                const answer = Algorithm.calc(formattedEquationStr);
                calcScreenTop.textContent = answer;
                lastAnswer = answer;
            } catch(error) {
                calcScreenTop.textContent = "ERROR";
                console.log(error);
            }
            
            negationInsertionStr = "";
            calcScreenBottom.textContent = "";
            break;
        default:
            str = btnTextContent;
            if (btn.classList.contains("func")){
                str += "(";
            }
    }

    let newStr = calcScreenBottom.textContent + str;

    if (newStr) {
        try {
            let formattedStr = Algorithm.getFormattedEquationStr(newStr);

            if (newStr.endsWith(".")) {
                formattedStr += "."
            } else if (newStr.trim().endsWith("-")) {
                formattedStr += " - "
            } 

            // string formatter removes trailing zeros
            if (btnTextContent == "0") {
                if (!bottomText) {
                    calcScreenBottom.textContent = "0.";
                } else {
                    calcScreenBottom.textContent += "0";
                }
            } else {
                calcScreenBottom.textContent = formattedStr;
            }

        } catch(error) {
            calcScreenBottom.textContent = "ERROR";
            console.log(error);
        }
    }
    updateParenthesesCounts();
}

const handleParentheses = (char) => {
    switch (char) {
        case "(":
            break;
    }
}

const handleBtnClick = (event) => {
    const btn = event.target;
    processBtnPress(btn, false);
}

const getBtnOrNullFromNumpadEvent = (event, isKeyDown) => {
    if ( /([0-9\/\*\-\+\.\^\)\()]|Enter)/.test(event.key) ){
        const btnText = event.key.replace("*", "×").replace("Enter", "=");
        const btn = BtnDict[btnText].element;
        return btn;
    } else if (isKeyDown && event.key == "Backspace" && !event.repeat){
        backspace();
    }
}

window.addEventListener("keyup", () => {
    const btn = getBtnOrNullFromNumpadEvent(event, false);
    if (btn) {
        btn.classList.remove("simulated-click");
    }
})

window.addEventListener("keydown", () => {
    const btn = getBtnOrNullFromNumpadEvent(event, true);
    if (btn && !event.repeat) { // fire once
        processBtnPress(btn, true);
    }
    updateParenthesesCounts();
})


const setup = () => {
    Object.keys(BtnDict).forEach(key => {
        const btnData = BtnDict[key];
        const btn = document.createElement('calc-btn');
        
        switch (key) {
            case "=":
                equalsBtn = btn;
                break;
            case ")":
                closingParenthesesBtn = btn;
                break;
        }

        btnData.element = btn;
    
        const suffix = btnData.suffix
        btn.id = `btn-${suffix}`;

        if (Algorithm.MATH_FUNC_NAMES.includes(suffix)){
            btn.classList.add('func');
        }
        const btnTextHolder = document.createElement('calc-btn-text');
    
        btnTextHolder.textContent = key;
        btn.appendChild(btnTextHolder)
    
        const btnGrid = document.querySelector('btn-grid');
        btnGrid.appendChild(btn);
        btn.addEventListener("click", handleBtnClick)
    
        layeredBtns = [BtnDict.sin.element,
                        BtnDict.cos.element,
                        BtnDict.tan.element,
                        BtnDict.log.element
                    ]
        
    })
}

setup();