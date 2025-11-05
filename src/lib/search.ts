import { Battery } from './types';

type Operator = '>' | '>=' | '<' | '<=' | '=' | '!=';

interface Filter {
  field: keyof Battery;
  operator: Operator;
  value: string | number;
}

type SearchNode = {
  type: 'AND' | 'OR' | 'NOT' | 'FILTER' | 'TERM' | 'EXACT_TERM';
  payload: SearchNode[] | Filter | string;
};


function tokenize(query: string): string[] {
  const regex = /([\w:]+(?:(?:>=|<=|>|<|=|!=)[\w.]+)?)|("([^"]+)")|([()~-])/g;
  return query.match(regex) || [];
}

function parse(tokens: string[]): [SearchNode, string[]] {
  if (tokens.length === 0) {
    return [{ type: 'TERM', payload: '' }, []];
  }

  const nodes: SearchNode[] = [];
  const operator: 'AND' | 'OR' = 'AND';

  while (tokens.length > 0 && tokens[0] !== ')') {
    const token = tokens.shift()!;
    if (!token) continue;

    if (token === '(') {
      const [node, remainingTokens] = parse(tokens);
      nodes.push(node);
      tokens = remainingTokens;
      if (tokens[0] === ')') tokens.shift(); // Consume closing parenthesis
    } else if (token === '~') {
      const left = nodes.pop();
      const [right, remaining] = parse([tokens.shift()!]);
      if (left) {
        nodes.push({ type: 'OR', payload: [left, right] });
      } else {
        nodes.push(right);
      }
      tokens = remaining.concat(tokens);
    } else if (token === '-') {
      const [node, remainingTokens] = parse(tokens.splice(0, 1));
      nodes.push({ type: 'NOT', payload: [node] });
      tokens = remainingTokens;
    } else {
      let match;
      if (match = token.match(/(\w+)(>=|<=|>|<|=|!=)([\w\.]+)/)) {
        nodes.push({ type: 'FILTER', payload: { field: match[1] as keyof Battery, operator: match[2] as Operator, value: isNaN(Number(match[3])) ? match[3] : Number(match[3]) } });
      } else if (match = token.match(/(\w+):([\w\.]+)/)) {
        nodes.push({ type: 'FILTER', payload: { field: match[1] as keyof Battery, operator: '=', value: match[2] } });
      } else {
        if (token.startsWith('"')) {
          nodes.push({ type: 'EXACT_TERM', payload: token.replace(/"/g, '') });
        } else {
          nodes.push({ type: 'TERM', payload: token });
        }
      }
    }
  }

  if (nodes.length === 1) {
    return [nodes[0], tokens];
  } else {
    return [{ type: operator, payload: nodes }, tokens];
  }
}

function parseSearchQuery(query: string): SearchNode {
  const tokens = tokenize(query);
  const [ast] = parse(tokens);
  return ast;
}

function evaluateSearchNode(battery: Battery, node: SearchNode): boolean {
  switch (node.type) {
    case 'AND':
      return (node.payload as SearchNode[]).every(n => evaluateSearchNode(battery, n));
    case 'OR':
      return (node.payload as SearchNode[]).some(n => evaluateSearchNode(battery, n));
    case 'NOT':
      return !(node.payload as SearchNode[]).every(n => evaluateSearchNode(battery, n));
    case 'FILTER':
      const filter = node.payload as Filter;
      const batteryValue = battery[filter.field];
      
      if (batteryValue === undefined) return false;

      const filterValue = filter.value;

      switch (filter.operator) {
        case '>': return batteryValue > filterValue;
        case '>=': return batteryValue >= filterValue;
        case '<': return batteryValue < filterValue;
        case '<=': return batteryValue <= filterValue;
        case '=': return String(batteryValue).toLowerCase() === String(filterValue).toLowerCase();
        case '!=': return String(batteryValue).toLowerCase() !== String(filterValue).toLowerCase();
        default: return false;
      }
    case 'TERM':
      const term = (node.payload as string).toLowerCase();
      if (!term) return true;
      return Object.values(battery).some(val => 
        String(val).toLowerCase().includes(term)
      );
    case 'EXACT_TERM':
      const exactTerm = (node.payload as string).toLowerCase();
      if (!exactTerm) return true;
      return Object.values(battery).some(val => 
        String(val).toLowerCase() === exactTerm
      );
    default:
      return true;
  }
}

export function filterBatteries(batteries: Battery[], query: string): Battery[] {
  if (!query) return batteries;
  
  const searchTree = parseSearchQuery(query);
  
  return batteries.filter(battery => evaluateSearchNode(battery, searchTree));
}
