import * as Algorithm from './lib/algorithm.js';

const calcScreenTop = document.querySelector("calc-screen-top");
const calcScreenBottom = document.querySelector("calc-screen-bottom");
let negationInsertionStr = "";
let lastAnswer = "";

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
	'min': {suffix: 'min',},
	'max': {suffix: 'max',},
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

const processBtnPress = (btn, simulated) => {
    const btnTextContent = btn.textContent;
    const topText = calcScreenTop.textContent;
    const bottomText = calcScreenBottom.textContent;
    const topLast = getLastTop();

    if (btn.textContent == "(") {
        negationInsertionStr = "(";
    }

    else if (isNaN(negationInsertionStr) && !isNaN(btnTextContent)) {
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

    const displayOperators = ["*", "+", "-", "/"];

    switch (btnTextContent){
        case "+":
        case "-":
        case "×":
        case "/":
            if (bottomText || (topText && !displayOperators.includes(topLast))){
                const char = btnTextContent;

                if (bottomText && !displayOperators.includes(topLast)) {
                    calcScreenTop.textContent = "";
                }

                try {
                    calcScreenTop.textContent += Algorithm.getFormattedEquationStr(`${bottomText} ${char} `)
                } catch {
                    calcScreenTop.textContent = "ERROR!"
                }

                calcScreenBottom.textContent = ""
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
                    } catch {
                        calcScreenBottom.textContent = "ERROR!"
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
            const hasValidNegationIndex = () => negationInsertionStr && bottomText.indexOf(negationInsertionStr) != -1;
            const hadValidNegationIndex = hasValidNegationIndex();

            if (bottomText) {
                calcScreenBottom.textContent = bottomText.slice(0, -1);
            }

            if (hadValidNegationIndex && !hasValidNegationIndex()) {
                negationInsertionStr = negationInsertionStr.slice(0, -1);
                if (!hasValidNegationIndex()) {
                    throw new Error(`negationInsertionStr (${negationInsertionStr}) not found in calcScreenBottom.textContent: ${calcScreenBottom.textContent}`)
                }
            }
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
            str = calcScreenBottom.textContent.includes(".") ? "" : "."
            break;
        case "=":
            const equationStr = calcScreenTop.textContent + calcScreenBottom.textContent;
            const formattedEquationStr = Algorithm.getFormattedEquationStr(equationStr);
            
            try {
                const answer = Algorithm.calc(formattedEquationStr);
                calcScreenTop.textContent = answer;
                lastAnswer = answer;
            } catch {
                calcScreenTop.textContent = "Error!";
            }
            
            negationInsertionStr = "";
            calcScreenBottom.textContent = "";
            break;
        case "0":
            str = bottomText ? "0" : "";
            break;
        default:
            str = btnTextContent;
            if (btn.classList.contains("func")){
                str += "(";
            }
    }

    let newStr = calcScreenBottom.textContent + str;

    const startsWithDecimalPoint = newStr.startsWith(".");
    if (newStr.startsWith(".")) {
        newStr = "0." + newStr;
    }

    if (newStr) {
        try {
            
            let formattedStr = Algorithm.getFormattedEquationStr(newStr);
            if (newStr.endsWith(".")) {
                formattedStr += "."
            }

            calcScreenBottom.textContent = formattedStr;
            
        } catch {
            calcScreenBottom.textContent = "Error!"
        }
    }
}

const handleBtnClick = (event) => {
    const btn = event.target;
    processBtnPress(btn, false);
}

const getBtnOrNullFromNumpadEvent = (event) => {
    if ( /([0-9\/\*\-\+\.]|Enter)/.test(event.key)){
        const btnText = event.key.replace("*", "×").replace("Enter", "=");
        const btn = BtnDict[btnText].element;
        return btn;
    }
}

window.addEventListener("keyup", () => {
    const btn = getBtnOrNullFromNumpadEvent(event);
    if (btn) {
        btn.classList.remove("simulated-click");
    }
})

window.addEventListener("keydown", () => {
    const btn = getBtnOrNullFromNumpadEvent(event);
    if (btn && !event.repeat) { // fire once
        processBtnPress(btn, true);
    }
})


const setup = () => {
    Object.keys(BtnDict).forEach(key => {
        const btnData = BtnDict[key];
        const btn = document.createElement('calc-btn');
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