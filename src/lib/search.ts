import type { Battery } from "./types";

// #region: Parser
// Simple tokenizer
const tokenize = (query: string): string[] => {
  const tokens = query.match(/"[^"]+"|\S+/g) || [];
  return tokens.flatMap(token => {
    if (token.startsWith('"') && token.endsWith('"')) {
      return token;
    }
    return token.split(/([()~])/).filter(Boolean);
  });
};

// Shunting-yard algorithm to convert infix to postfix (RPN)
const toPostfix = (tokens: string[]): string[] => {
    const precedence: { [key: string]: number } = { 'OR': 1, '~': 1, 'AND': 2 };
    const output: string[] = [];
    const operators: string[] = [];

    let lastTokenWasOperand = false;

    for (const token of tokens) {
        if (token.trim() === '') continue;

        if (token === '(') {
            if (lastTokenWasOperand) {
                operators.push('AND');
            }
            operators.push(token);
            lastTokenWasOperand = false;
        } else if (token === ')') {
            while (operators.length && operators[operators.length - 1] !== '(') {
                output.push(operators.pop()!);
            }
            operators.pop(); // Pop '('
            lastTokenWasOperand = true;
        } else if (precedence[token.toUpperCase()]) {
            const op = token.toUpperCase();
            while (
                operators.length &&
                operators[operators.length - 1] !== '(' &&
                precedence[operators[operators.length - 1]] >= precedence[op]
            ) {
                output.push(operators.pop()!);
            }
            operators.push(op);
            lastTokenWasOperand = false;
        } else { // Operand
            if (lastTokenWasOperand) {
                operators.push('AND');
            }
            output.push(token);
            lastTokenWasOperand = true;
        }
    }

    while (operators.length) {
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
    const searchableFields = ['brand', 'model', 'type', 'barcode', 'location']; // MODIFIED HERE
    return searchableFields.some(field => {
        const value = battery[field as keyof Battery];
        return typeof value === 'string' && value.toLowerCase().trim() === exactTerm;
    });
  }

  let negate = false;
  if (term.startsWith('-')) {
    negate = true;
    term = term.substring(1);
  }

  // Field-specific search (e.g., score:>50)
  const fieldMatch = term.match(/^([a-z_]+):(.+)$/);
  if (fieldMatch) {
    const [, field, value] = fieldMatch;
    return evaluateFieldSearch(battery, field, value, negate);
  }

  // General tag search
  const result = evaluateGeneralTagSearch(battery, term);
  return negate ? !result : result;
};

const evaluateFieldSearch = (battery: Battery, field: string, value: string, negate: boolean): boolean => {
  const operatorMatch = value.match(/^(>=|<=|>|<|=)?(.+)$/);
  if (!operatorMatch) return false;

  const [, op, valStr] = operatorMatch;
  const operator = op || '=';
  const valNum = parseFloat(valStr);

  const batteryValue = battery[field as keyof Battery];

  let result = false;

  // Date related fields
  if (field === 'created_at' || field === 'updated_at' || field === 'lastUsed' || field === 'since' || field === 'until_time') {
    const batteryDate = batteryValue ? new Date(batteryValue as string).getTime() : 0;
    if (!batteryDate) return false;

    if (field === 'since') {
        const sinceDate = new Date(valStr).getTime();
        result = batteryDate >= sinceDate;
        return negate ? !result : result;
    }

    if (field === 'until_time') {
        const untilDate = parseInt(valStr, 10) * 1000; // Assuming unix timestamp in seconds
        if (!isNaN(untilDate)) {
            result = batteryDate <= untilDate;
            return negate ? !result : result;
        }
    }

    const dateRangeMatch = valStr.match(/^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})$/);
    if (dateRangeMatch) {
      const startDate = new Date(dateRangeMatch[1]).getTime();
      const endDate = new Date(dateRangeMatch[2]).getTime();
      result = batteryDate >= startDate && batteryDate <= endDate;
      return negate ? !result : result;
    }
  }

  if (field === 'fav') {
    result = value === 'me' ? battery.fav === true : false;
    return negate ? !result : result;
  }

  if (field === 'packSize') {
    const packSize = battery.packSize;
    if (typeof packSize === 'number' && !isNaN(valNum)) {
      switch (operator) {
        case '>=': result = packSize >= valNum; break;
        case '<=': result = packSize <= valNum; break;
        case '>': result = packSize > valNum; break;
        case '<': result = packSize < valNum; break;
        case '=': result = packSize === valNum; break;
        default: result = packSize === valNum; break;
      }
    }
    return negate ? !result : result;
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
    if (valStr.includes('*')) {
      const regex = new RegExp(`^${valStr.replace(/\*/g, '.*')}$`, 'i');
      result = regex.test(batteryValue.trim());
    } else {
      result = batteryValue.toLowerCase().trim() === valStr.toLowerCase();
    }
  } else if (typeof batteryValue === 'boolean') {
    result = batteryValue === (valStr === 'true');
  }

  return negate ? !result : result;
};

const evaluateGeneralTagSearch = (battery: Battery, term: string): boolean => {
  const searchableFields = ['brand', 'model', 'type', 'barcode', 'location'];
  const lowerTerm = term.toLowerCase();

  // REMOVED packSize check from here

  if (lowerTerm.includes('*')) {
    const regex = new RegExp(`^${lowerTerm.replace(/\*/g, '.*')}$`, 'i');
    return searchableFields.some(field => {
      const value = battery[field as keyof Battery];
      return typeof value === 'string' && regex.test(value.trim());
    });
  }

  return searchableFields.some(field => {
    const value = battery[field as keyof Battery];
    return typeof value === 'string' && value.toLowerCase().trim().includes(lowerTerm);
  });
};

const evaluatePostfix = (postfix: string[], battery: Battery): boolean => {
  const stack: boolean[] = [];

  for (const token of postfix) {
    if (token === 'AND') {
      const right = stack.pop() ?? false;
      const left = stack.pop() ?? false;
      stack.push(left && right);
    } else if (token === 'OR' || token === '~') {
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

  // Extract ?random term
  let random = false;
  if (searchTerm.includes('?random')) {
    random = true;
    searchTerm = searchTerm.replace('?random', '').trim();
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

  if (random) {
    // Shuffle the array
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
  }

  return filtered;
};
// #endregion
