import * as Algorithm from './lib/algorithm.js';

const calcScreenTop = document.querySelector("calc-screen-top");
const calcScreenBottom = document.querySelector("calc-screen-bottom");

const BtnDict = {
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
	'X!': {suffix: 'fact',},
	'AC': {suffix: 'clear-all',},
	'C': {suffix: 'clear',},
	'Del': {suffix: 'del',},
	'sign': {suffix: 'sign',},
	'log': {suffix: 'log',},
	'(': {suffix: 'open',},
	')': {suffix: 'close',},
	'×': {suffix: 'multiply',},
	'%': {suffix: 'divide',},
	'+': {suffix: 'add',},
	'-': {suffix: 'subtract',},
	'sin': {suffix: 'sin',},
	'cos': {suffix: 'cos',},
	'tan': {suffix: 'tan',},
	'FUNC': {suffix: 'func',},
	'.': {suffix: 'decimal',},
	'=': {suffix: 'sum',},
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
    let str = "";

    if (simulated) {
        btn.classList.add("simulated-click");
    }

    const btnTextContent = btn.textContent;
    const topText = calcScreenTop.textContent;
    const bottomText = calcScreenBottom.textContent;
    const topLast = getLastTop();
    switch (btnTextContent){
        case "×":
        case "+":
        case "-":
        case "%":
            if (bottomText || (topText && !["×", "+", "-", "/"].includes(topLast))){
                const char = btnTextContent == "%" ? "/" :  btnTextContent;
                calcScreenTop.textContent += `${bottomText} ${char} `
                calcScreenBottom.textContent = ""
            }
            break;
        case "AC":
            calcScreenTop.textContent = "";
            calcScreenBottom.textContent = "";
            break;
        case "C":
            calcScreenBottom.textContent = "";
            break;
        case ".":
            str = calcScreenBottom.textContent.includes(".") ? "" : "."
            break;
        case "=":
            // TODO: CALCULATE AND UPDATE SCREEN
            console.log("TODO: CALCULATE AND UPDATE SCREEN")
            const equationStr = calcScreenTop.textContent + calcScreenBottom.textContent;
            const formattedEquationStr = Algorithm.getFormattedEquationStr(equationStr);
            const answer = Algorithm.calc(formattedEquationStr);
            if (isNaN(answer)){
                calcScreenBottom.textContent = "NaN";
            } else {
                calcScreenTop.textContent = answer;
            }
            
            // console.log(`calcScreenTop.textContent + calcScreenBottom.textContent: ${calcScreenTop.textContent + calcScreenBottom.textContent}`)
            console.log(`formattedEquationStr: ${formattedEquationStr}`);
            console.log(`answer: ${answer}`);
            
            calcScreenBottom.textContent = "";
            break;
        case "0":
            str = bottomText ? "0" : "";
            break;
        default:
            str = btnTextContent;
    }

    calcScreenBottom.textContent += str;
}

const handleBtnClick = (event) => {
    const btn = event.target;
    console.log(`clicked: ${btn.id}`)
    processBtnPress(btn, false);
}

const getBtnOrNullFromNumpadEvent = (event) => {
    if ( /([0-9\/\*\-\+\.]|Enter)/.test(event.key)){
        const btnText = event.key.replace("/", "%").replace("*", "×").replace("Enter", "=");
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
    console.log(`event.key: ${event.key}`)
    const btn = getBtnOrNullFromNumpadEvent(event);
    if (btn && !event.repeat) { // fire once
        processBtnPress(btn, true);
    }
})

Object.keys(BtnDict).forEach(key => {
    const btnData = BtnDict[key];
    const btn = document.createElement('calc-btn');
    btnData.element = btn;

    const suffix = btnData.suffix
    btn.id = `btn-${suffix}`;
    console.log(`btn.id: ${btn.id}`)
    if (Algorithm.MATH_FUNC_NAMES.includes(suffix)){
        btn.classList.add('func');
    }
    const btnTextHolder = document.createElement('calc-btn-text');

    btnTextHolder.textContent = key;
    btn.appendChild(btnTextHolder)

    const btnGrid = document.querySelector('btn-grid');
    btnGrid.appendChild(btn);
    btn.addEventListener("click", handleBtnClick)
})

const DEBUG_STR = "2 * 4 + 3 - .3-4. - 5 - -3 ^ abs(---------5)"
console.log(DEBUG_STR)
const DEBUG_ANSWER = Algorithm.calc(DEBUG_STR);
console.log(`DEBUG_ANSWER: ${DEBUG_ANSWER}`);


Object.keys(BtnDict).forEach(key => {
    console.log(`btn-${key}`);
})


console.log(`BtnDict:`)
console.log(BtnDict)