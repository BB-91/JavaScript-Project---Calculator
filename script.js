const calcScreen = document.querySelector("calc-screen");

const BTN_TAGNAME = {
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

const handleBtnClick = (event) => {
    const btn = event.target;
    console.log(`clicked btn with id: ${btn.id}`);
    let str = "";
    switch (btn.textContent){
        case "%":
            str = "/";
            break;
        case "AC":
            calcScreen.textContent = "";
            break;
        case ".":
            str = calcScreen.textContent.includes(".") ? "" : "."
            break;
        default:
            str = btn.textContent;
    }


    calcScreen.textContent += str;
}

Object.values(BTN_TAGNAME).forEach(btnTagName => {
    const element = document.querySelector("#" + btnTagName);
    element.addEventListener("click", handleBtnClick)
})