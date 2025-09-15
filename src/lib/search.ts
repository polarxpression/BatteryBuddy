import type { Battery } from "./types";
import { levenshteinDistance } from "./string";

// #region: Parser
// Simple tokenizer
const tokenize = (query: string): string[] => {
  const tokens = query.match(/"[^"]+"|\S+/g) || [];
  return tokens.flatMap(token => {
    if (token.startsWith('"') && token.endsWith('"')) {
      return token;
    }
    return token.split(/([()])/).filter(Boolean);
  });
};

// Shunting-yard algorithm to convert infix to postfix (RPN)
const toPostfix = (tokens: string[]): string[] => {
  const output: string[] = [];
  const operators: string[] = [];
  const precedence: { [key: string]: number } = { 'OR': 1, 'AND': 2 };

  let lastTokenWasOperand = false;

  for (const token of tokens) {
    if (token.trim() === '') continue;

    if (token === '(') {
      if (lastTokenWasOperand) {
        while (operators.length > 0 && precedence[operators[operators.length - 1]] >= precedence['AND']) {
          output.push(operators.pop()!);
        }
        operators.push('AND');
      }
      operators.push(token);
      lastTokenWasOperand = false;
    } else if (token === ')') {
      while (operators.length > 0 && operators[operators.length - 1] !== '(') {
        output.push(operators.pop()!);
      }
      operators.pop(); // Pop '('
      lastTokenWasOperand = true;
    } else if (precedence[token.toUpperCase()]) {
      const op = token.toUpperCase();
      while (operators.length > 0 && operators[operators.length - 1] !== '(' && precedence[operators[operators.length - 1]] >= precedence[op]) {
        output.push(operators.pop()!);
      }
      operators.push(op);
      lastTokenWasOperand = false;
    } else { // Operand
      if (lastTokenWasOperand) {
        while (operators.length > 0 && precedence[operators[operators.length - 1]] >= precedence['AND']) {
          output.push(operators.pop()!);
        }
        operators.push('AND');
      }
      output.push(token);
      lastTokenWasOperand = true;
    }
  }

  while (operators.length > 0) {
    output.push(operators.pop()!);
  }

  return output;
};
// #endregion

// #region: Evaluator
const evaluateTerm = (battery: Battery, term: string): boolean => {
  term = term.trim();
  if (!term) return true;

  // Handle quoted exact match
  if (term.startsWith('"') && term.endsWith('"')) {
    const exactTerm = term.substring(1, term.length - 1).toLowerCase();
    const searchableFields = ['brand', 'model', 'type', 'barcode', 'location'];
    const result = searchableFields.some(field => {
        const value = battery[field as keyof Battery];
        return typeof value === 'string' && value.toLowerCase() === exactTerm;
    });
    return result;
  }

  let negate = false;
  if (term.startsWith('-')) {
    negate = true;
    term = term.substring(1);
  }

  let fuzzy = false;
  if (term.startsWith('~')) {
    fuzzy = true;
    term = term.substring(1);
  }

  // Field-specific search (e.g., score:>50)
  const fieldMatch = term.match(/^([a-z_]+):(.+)$/);
  if (fieldMatch) {
    const [, field, value] = fieldMatch;
    return evaluateFieldSearch(battery, field, value, fuzzy, negate);
  }

  // General tag search
  const result = evaluateGeneralTagSearch(battery, term, fuzzy);
  return negate ? !result : result;
};

const evaluateFieldSearch = (battery: Battery, field: string, value: string, fuzzy: boolean, negate: boolean): boolean => {
  const operatorMatch = value.match(/^(>=|<=|>|<|=)?(.+)$/);
  if (!operatorMatch) return false;

  const [, op, valStr] = operatorMatch;
  const operator = op || '=';
  const valNum = parseFloat(valStr);

  const batteryValue = battery[field as keyof Battery];

  let result = false;

  // Date range
  if (field === 'created_at' || field === 'updated_at' || field === 'lastUsed') {
    const dateRangeMatch = valStr.match(/^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})$/);
    if (dateRangeMatch) {
      const batteryDate = new Date(batteryValue as string).getTime();
      const startDate = new Date(dateRangeMatch[1]).getTime();
      const endDate = new Date(dateRangeMatch[2]).getTime();
      result = batteryDate >= startDate && batteryDate <= endDate;
      return negate ? !result : result;
    }
  }

  if (typeof batteryValue === 'number' && !isNaN(valNum)) {
    switch (operator) {
      case '>=': result = batteryValue >= valNum; break;
      case '<=': result = batteryValue <= valNum; break;
      case '>': result = batteryValue > valNum; break;
      case '<': result = batteryValue < valNum; break;
      case '=': result = batteryValue === valNum; break;
    }
  } else if (typeof batteryValue === 'string') {
    if (fuzzy) {
      result = levenshteinDistance(batteryValue.toLowerCase(), valStr.toLowerCase()) <= 2;
    } else if (valStr.includes('*')) {
      const regex = new RegExp(`^${valStr.replace(/\*/g, '.*')}$`, 'i');
      result = regex.test(batteryValue);
    } else {
      result = batteryValue.toLowerCase() === valStr.toLowerCase();
    }
  } else if (typeof batteryValue === 'boolean') {
    result = batteryValue === (valStr === 'true');
  }

  return negate ? !result : result;
};

const evaluateGeneralTagSearch = (battery: Battery, term: string, fuzzy: boolean): boolean => {
  const searchableFields = ['brand', 'model', 'type', 'barcode', 'location'];
  const lowerTerm = term.toLowerCase();

  if (fuzzy) {
    return searchableFields.some(field => {
      const value = battery[field as keyof Battery];
      return typeof value === 'string' && levenshteinDistance(value.toLowerCase(), lowerTerm) <= 2;
    });
  }

  if (lowerTerm.includes('*')) {
    const regex = new RegExp(`^${lowerTerm.replace(/\*/g, '.*')}$`, 'i');
    return searchableFields.some(field => {
      const value = battery[field as keyof Battery];
      return typeof value === 'string' && regex.test(value);
    });
  }

  return searchableFields.some(field => {
    const value = battery[field as keyof Battery];
    return typeof value === 'string' && value.toLowerCase() === lowerTerm;
  });
};

const evaluatePostfix = (postfix: string[], battery: Battery): boolean => {
  const stack: boolean[] = [];

  for (const token of postfix) {
    if (token === 'AND') {
      const right = stack.pop() ?? false;
      const left = stack.pop() ?? false;
      stack.push(left && right);
    } else if (token === 'OR') {
      const right = stack.pop() ?? false;
      const left = stack.pop() ?? false;
      stack.push(left || right);
    } else {
      stack.push(evaluateTerm(battery, token));
    }
  }
  return stack[0] ?? false;
};
// #endregion

// #region: Main Filter Function
export const filterBatteries = (batteries: Battery[], searchTerm: string): Battery[] => {
  if (!searchTerm) {
    return batteries;
  }

  // Extract order: term
  let order: { field: string, direction: 'asc' | 'desc' } | null = null;
  const orderMatch = searchTerm.match(/order:(\w+)( (asc|desc))?/);
  if (orderMatch) {
    searchTerm = searchTerm.replace(orderMatch[0], '').trim();
    order = {
      field: orderMatch[1],
      direction: (orderMatch[3] as 'asc' | 'desc') || 'asc'
    };
  }

  const tokens = tokenize(searchTerm);
  const postfix = toPostfix(tokens);

  const filtered = batteries.filter(battery => evaluatePostfix(postfix, battery));

  if (order) {
    filtered.sort((a, b) => {
      const aValue = a[order!.field as keyof Battery];
      const bValue = b[order!.field as keyof Battery];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (aValue < bValue) return order!.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return order!.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return filtered;
};
// #endregion