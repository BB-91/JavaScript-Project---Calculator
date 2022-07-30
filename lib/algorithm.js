// Shunting Yard Algorithm: https://en.wikipedia.org/wiki/Shunting_yard_algorithm

const OPERATOR_DATA = {
    "^": { precedence: 4, isLeftAssociative: false },
    "*": { precedence: 3, isLeftAssociative: true },
    "/": { precedence: 3, isLeftAssociative: true },
    "+": { precedence: 2, isLeftAssociative: true }, // addition
    " + ": { precedence: 2, isLeftAssociative: true }, // addition
    "-": { precedence: 2, isLeftAssociative: true }, // unary negative
    " - ": { precedence: 2, isLeftAssociative: true }, // subtraction
}

const FUNC = {
    "^"(a, b) { return a ** b },
    "*"(a, b) { return a * b },
    "/"(a, b) { return a / b },
    "+"(a, b) { return a + b },
    " + "(a, b) { return a + b },
    "-"(a) { return -a },
    " - "(a, b) { return a - b },
}

const MATH_FUNC_NAMES = Object.getOwnPropertyNames(Math).filter(name => typeof Math[name] == "function");

MATH_FUNC_NAMES.forEach(FUNC_NAME => {
    FUNC[FUNC_NAME] = Math[FUNC_NAME];
})

const operators = Object.keys(OPERATOR_DATA);
const isOperator = (token) => operators.includes(token);
const isNum = (value) => typeof value == "number" && !isNaN(value);
const isFuncName = (token) => Object.keys(FUNC).includes(token);
const getFuncCallStr = (funcName, ...args) => `${funcName}(${args.join(", ")})`;
const getPrecedence = (token) => isOperator(token) ? OPERATOR_DATA[token].precedence : 1;
const isLeftAssociative = (token) => {
    if (!isOperator(token)) {
        throw new Error(`Not an operator: ${token}`);
    } else {
        return OPERATOR_DATA[token].isLeftAssociative;
    }
}

const getFuncData = (token) => {
    if (!Object.keys(FUNC).includes(token)) {
        throw new Error(`Not a key in FUNC obj: ${token}`);
    } else {
        const func = FUNC[token];
        const expectedArgCount = func.length;
        return { func, expectedArgCount };
    }
}


const getTokens = (equationStr) => {
    equationStr = equationStr.replaceAll("--", "");
    equationStr = equationStr.replaceAll(/(\d+\.?\d*)-(\d+\.?\d*)/g, `$1 - $2`);

    const regex = /(-?\d+\.?\d*|[A-Z]+| - |-| \+ |\+|\*\*|[\)\(\*\/\^\+\-])/ig;
    const matches = equationStr.match(regex);
    const tokens = matches.map(match => {
        if (!isNaN(match)) {
            return Number(match);
        }
        switch (match) {
            case "+": return " + ";
            default: return match;
        }
    })
    return tokens;
}


const getResult = (token, ...args) => {
    let result = null;

    args.forEach(arg => {
        if (typeof arg != "number") {
            throw new Error(`Not a number: ${arg} --- token: ${token}`);
        }
    })

    const { func, expectedArgCount } = getFuncData(token);

    if (args.length != expectedArgCount) {
        throw new Error(`function '${func}' expects ${expectedArgCount} arguments, got ${args.length}`);
    } else {
        result = func(...args);
    }

    if (result === undefined || result === null || isNaN(result)) {
        throw new Error(`Invalid result from func call: ${getFuncCallStr(token, ...args)}`);
    }

    return result;
}


const postfixToResult = (outputQueue) => {
    const answerStack = []
    while (outputQueue.length) {
        const token = outputQueue.shift();

        if (isNum(token)) {
            answerStack.push(token);
        } else if (isFuncName(token)) { // includes operator token keys
            const { func, expectedArgCount } = getFuncData(token);

            if (answerStack.length < expectedArgCount) {
                throw new Error(`${func.name} expects ${expectedArgCount} arguments, got ${answerStack.length}`);
            }

            let argArr = [];
            for (let i = 0; i < expectedArgCount; i++) {
                argArr.unshift(answerStack.pop());
            }

            answerStack.push(getResult(token, ...argArr));
            argArr.length = 0;

        } else {
            throw new Error(`Unexpected token: ${token}`);
        }
    }

    if (answerStack.length != 1) {
        throw new Error(`Expected exactly 1 token left in answer stack. Got: ${answerStack}`);
    }

    return answerStack.pop();
}


const infixToPostfix = (equationStr) => { // infix notation -> postfix notation -> result
    if (typeof equationStr != "string") {
        throw new Error(`Not a string: ${equationStr}`);
    }

    const stack = [];
    const outputQueue = [];
    const tokens = getTokens(equationStr);
    const getStackTop = () => !stack.length ? null : stack[stack.length - 1];
    const getPrecedenceOfTokenOnTopOfStack = () => !stack.length ? -1 : getPrecedence(getStackTop())

    tokens.forEach(token => {
        if (isNum(token)) {
            outputQueue.push(token);
        } else {
            if (isOperator(token)) {
                const op1 = getPrecedence(token); // operator 1 precedence
                const op2 = getPrecedenceOfTokenOnTopOfStack(); // operator 2 precedence
                const equalprecedence = op1 === op2;

                while (op2 != -1 && getStackTop() != "(" && (op2 > op1 || (equalprecedence && isLeftAssociative(token)))) {
                    outputQueue.push(stack.pop());
                }

                stack.push(token);
            } else if (token == "(") {
                stack.push(token);
            } else if (token == ")") {
                while (getStackTop() != "(") {
                    if (!stack.length) {
                        throw new Error(`mismatched parentheses.`);
                    }
                    outputQueue.push(stack.pop());
                }
                stack.pop() // discard left parentheses
                if (MATH_FUNC_NAMES.includes(getStackTop())) {
                    outputQueue.push(stack.pop());
                }
            } else if (MATH_FUNC_NAMES.includes(token)) {
                stack.push(token);
            } else {
                throw new Error(`Unexpected token: ${token}`);
            }
        }
    })

    while (stack.length) {
        const token = stack.pop();
        if (token == "(") {
            throw new Error(`mismatched parentheses.`);
        }
        outputQueue.push(token);
    }

    return outputQueue;
}


const calc = (equationStr) => {
    const postfix = infixToPostfix(equationStr);
    const result = postfixToResult(postfix);
    return result;
}


export { calc };

console.log(`--- ALL FUNCTION NAMES ---`);
Object.keys(FUNC).forEach((key, index) => {
    console.log(`${index}: ${key}`);
})