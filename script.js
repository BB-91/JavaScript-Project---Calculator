// const calcScreen = document.querySelector("calc-screen");
const calcScreenTop = document.querySelector("calc-screen-top");
const calcScreenBottom = document.querySelector("calc-screen-bottom");

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

const handleBtnClick = (event) => {
    const btn = event.target;
    // console.log(`clicked btn with id: ${btn.id}`);
    let str = "";
    switch (btn.textContent){
        case "×":
        case "+":
        case "-":
        case "%":
            const lastScreenBottomChar = getLastChar(calcScreenBottom.textContent);
            if (!["×", "+", "-", "/"].includes(lastScreenBottomChar)){
                str = btn.textContent == "%" ? "/" :  btn.textContent;
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
        default:
            str = btn.textContent;
    }


    calcScreenBottom.textContent += str;
}

Object.values(BTN_TAGNAME).forEach(btnTagName => {
    const element = document.querySelector("#" + btnTagName);
    element.addEventListener("click", handleBtnClick)
})