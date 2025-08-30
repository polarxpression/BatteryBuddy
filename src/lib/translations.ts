export const translations = {
  'chat:ai_manager': 'Gerenciador de IA',
  'chat:clear_chat': 'Limpar chat',
  'chat:composing_response': 'Compondo resposta...',
  'chat:expand_thinking': 'Expandir pensamento',
  'chat:collapse_thinking': 'Recolher pensamento',
  'chat:model_generating_answer': 'O modelo está gerando uma resposta. Isso indica que o modelo ainda está compondo; ele aparecerá abaixo quando estiver pronto.',
  'chat:expand_tool_response': 'Expandir resposta da ferramenta',
  'chat:collapse_tool_response': 'Recolher resposta da ferramenta',
  'chat:type_message': 'Digite sua mensagem...',
  'chat:send': 'Enviar',
  'chat:thinking': 'Pensando...',
  'chat:using_tools': 'Usando ferramentas...',
  'chat:adding_battery': 'Adicionando bateria...',
  'chat:exporting_csv': 'Exportando para CSV...',
  'chat:generating_report': 'Gerando relatório...',
  'chat:updating_quantity': 'Atualizando quantidade...',
};

export type TranslationKey = keyof typeof translations;
