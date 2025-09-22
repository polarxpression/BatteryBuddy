export const translations = {

  'search:title': 'Guia de Sintaxe de Busca',
  'search:description': 'Domine a barra de busca com estas poderosas opções de sintaxe.',
  'search:basic_search': 'Busca Básica',
  'search:basic_search_desc': 'Basta digitar o que você está procurando. A busca procurará por correspondências nos campos de marca, modelo, tipo, código de barras e localização.',
  'search:example': 'Exemplo:',
  'search:boolean_operators': 'Operadores Booleanos',
  'search:boolean_operators_desc': 'Combine termos com AND, OR e agrupe com parênteses (). AND é usado por padrão se nenhum operador estiver presente.',
  'search:syntax': 'Sintaxe',
  'search:desc': 'Descrição',
  'search:find_both_terms': 'Encontra baterias que correspondem a ambos os termos (AND implícito).',
  'search:same_as_above': 'O mesmo que acima.',
  'search:find_either_term': 'Encontra baterias que correspondem a qualquer um dos termos.',
  'search:group_conditions': 'Agrupe condições para consultas complexas.',
  'search:advanced_search': 'Busca Avançada',
  'search:exact_phrase': 'Busca por uma frase exata.',
  'search:exclude_term': 'Exclui baterias que correspondem ao termo.',
  'search:fuzzy_search': 'Busca difusa por termos semelhantes (até 2 caracteres de diferença).',
  'search:specific_field': 'Busca dentro de um campo específico.',
  'search:numeric_comparison': 'Comparação numérica (também funciona com >=, <, <=).',
  'search:wildcard_search': 'Busca com curinga.',
  'search:date_range': 'Busca por um intervalo de datas.',
  'search:show_favorites': 'Mostra apenas baterias favoritas.',
  'search:sorting_randomization': 'Ordenação e Randomização',
  'search:sort_asc': 'Ordena os resultados por um campo (ascendente por padrão).',
  'search:sort_desc': 'Ordena os resultados por um campo em ordem decrescente.',
  'search:random_results': 'Obtém um conjunto aleatório de resultados.',
  'search:available_fields': 'Campos Disponíveis',
  'search:available_fields_desc': 'Você pode usar os seguintes campos para pesquisas específicas de campo:',
  
  'search:find_either_term_tilde': 'O mesmo que OR. Encontra baterias que correspondem a qualquer um dos termos.',
  
  'location:gondola': 'Gôndola',
  'location:stock': 'Estoque',
};

export type TranslationKey = keyof typeof translations;