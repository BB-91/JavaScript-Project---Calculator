// const calcScreen = document.querySelector("calc-screen");
const calcScreenTop = document.querySelector("calc-screen-top");
const calcScreenBottom = document.querySelector("calc-screen-bottom");
const BtnTextObj = {} // { btnText : btn } initialized when asigning btn click handlers
const numPadRegex = /[0-9\/\*\-\+\.]/;

const BTN_TAGNAME = {
    clearAll: "btn-clear-all",
    clear: "btn-clear",
    divide: "btn-divide",
    multiply: "btn-multiply",
    subtract: "btn-subtract",
    add: "btn-add",
    sum: "btn-sum",
    decimal: "btn-decimal",
    0: "btn-0",
    1: "btn-1",
    2: "btn-2",
    3: "btn-3",
    4: "btn-4",
    5: "btn-5",
    6: "btn-6",
    7: "btn-7",
    8: "btn-8",
    9: "btn-9",
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
            if (bottomText || !["×", "+", "-", "/"].includes(topLast)){
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
    processBtnPress(btn, false);
}

const getBtnOrNullFromNumpadEvent = (event) => {
    if (numPadRegex.test(event.key)){
        const btnText = event.key.replace("/", "%").replace("*", "×");
        const btn = BtnTextObj[btnText];
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

Object.values(BTN_TAGNAME).forEach(btnTagName => {
    const btn = document.querySelector("#" + btnTagName);
    BtnTextObj[btn.textContent] = btn;
    btn.addEventListener("click", handleBtnClick)
})