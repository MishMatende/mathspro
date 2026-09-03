export function safeCalculate(input) {
  const source = input.replace(/×/g, "*").replace(/÷/g, "/").replace(/%/g, "/100");
  if (!/^[\d\s.+\-*/()]+$/.test(source)) throw new Error("Invalid expression");
  const tokens = source.match(/\d*\.?\d+|[()+\-*/]/g) || [];
  const values = [];
  const operators = [];
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };
  const apply = () => {
    const operator = operators.pop();
    const right = values.pop();
    const left = values.pop();
    if (left === undefined || right === undefined) throw new Error("Invalid expression");
    if (operator === "+") values.push(left + right);
    if (operator === "-") values.push(left - right);
    if (operator === "*") values.push(left * right);
    if (operator === "/") {
      if (right === 0) throw new Error("Cannot divide by zero");
      values.push(left / right);
    }
  };
  let previous = "operator";
  tokens.forEach((token) => {
    if (/^\d/.test(token) || token.startsWith(".")) { values.push(Number(token)); previous = "number"; return; }
    if (token === "(") { operators.push(token); previous = "operator"; return; }
    if (token === ")") {
      while (operators.length && operators.at(-1) !== "(") apply();
      if (operators.pop() !== "(") throw new Error("Mismatched parentheses");
      previous = "number"; return;
    }
    if (token === "-" && previous === "operator") values.push(0);
    while (operators.length && precedence[operators.at(-1)] >= precedence[token]) apply();
    operators.push(token); previous = "operator";
  });
  while (operators.length) {
    if (operators.at(-1) === "(") throw new Error("Mismatched parentheses");
    apply();
  }
  if (values.length !== 1 || !Number.isFinite(values[0])) throw new Error("Invalid expression");
  return Number(values[0].toFixed(10));
}
