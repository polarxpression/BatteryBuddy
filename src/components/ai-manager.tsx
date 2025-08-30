'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileDown, FileUp, Plus, Pencil, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';

import { Battery } from '@/lib/types';
import { Content, FunctionCall } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, { useRef } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import TextareaAutosize from 'react-textarea-autosize';

declare module '@google/genai' {
  interface Content {
    timestamp?: number;
  }
}


interface AiManagerProps {
  addBattery: (data: Battery) => Promise<void>;
  updateBatteryQuantity: (brand: string, model: string, newQuantity: number) => Promise<void>;
  handleExport: () => void;
    handleGenerateReport: (outputType: 'print' | 'download') => void;
  batteries: Battery[];
}

interface FunctionCallArgs {
  brand?: string;
  model?: string;
  type?: string;
  packSize?: number;
  quantity?: number | string;
  newQuantity?: number | string;
  amount?: number | string;
  category?: string;
  id?: string;
  outputType?: 'print' | 'download';
}

const components = {
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="list-disc ml-4" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal ml-4" {...props} />,
};

export function AiManager({
  addBattery,
  updateBatteryQuantity,
  handleExport,
  handleGenerateReport,
  batteries
}: AiManagerProps) {
  const { t } = useTranslation();
  const [history, setHistory] = useState<Content[]>([]);
  const [message, setMessage] = useState('');
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'thinking' | 'tool_usage'>('idle');
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [openTool, setOpenTool] = useState<string | null>(null);
  const [thinkingCollapsed, setThinkingCollapsed] = useState<boolean>(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const handleToolToggle = (key: string) => {
    setOpenTool(prev => (prev === key ? null : key));
  };

  // index of last user message in history (for inline thinking indicator placement)
  const lastUserIndex = (() => {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'user') return i;
    }
    return -1;
  })();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (status !== 'tool_usage') {
      setCurrentTool(null);
    }
  }, [status]);

  useEffect(() => {
    scrollToBottom();
  }, [history, streamingMessage]);

  const executeCommand = async (functionCall: FunctionCall) => {
    if (!functionCall || !functionCall.name || !functionCall.args) return null;

    switch (functionCall.name) {
      case 'add_battery':
        // If a matching battery (brand+model+type+packSize) already exists, update its quantity
        try {
          const payload = functionCall.args as FunctionCallArgs;
          const incomingQuantity = typeof payload?.quantity === 'string' ? parseInt(payload.quantity, 10) : (payload?.quantity ?? 0);
          const incomingPackSize = payload?.packSize ?? 1;
          const incomingBrand = payload?.brand;
          const incomingModel = payload?.model;

          if (incomingBrand && incomingModel) {
            const existing = batteries.find(b => b.brand === incomingBrand && b.model === incomingModel && b.type === (payload.type ?? b.type) && b.packSize === incomingPackSize);
            if (existing) {
              const newQuantity = (existing.quantity ?? 0) + (Number.isFinite(incomingQuantity) ? incomingQuantity : 0);
              await updateBatteryQuantity(existing.brand || '', existing.model || '', newQuantity);
              return `Updated quantity for battery ${existing.brand || ''} ${existing.model || ''} to ${newQuantity}.`;
            }
          }

          // No existing match — create a new battery entry. Ensure quantity/packSize are numbers and id exists.
          const toAdd: Battery = {
            id: payload.id || crypto.randomUUID(),
            brand: payload.brand || '',
            model: payload.model || '',
            type: payload.type || payload?.category || '',
            quantity: Number.isFinite(incomingQuantity) ? incomingQuantity : 0,
            packSize: incomingPackSize,
          };
          await addBattery(toAdd);
          return 'The battery has been added successfully.';
        } catch (e) {
          console.error('Error in add_battery handler', e);
          // fallback to original behavior
          await addBattery(functionCall.args as Battery);
          return 'The battery has been added successfully.';
        }
      case 'update_battery_quantity':
        {
          const args = functionCall.args as FunctionCallArgs || {};
          const brand = args.brand;
          const model = args.model;
          const rawNewQuantity = args.newQuantity ?? args.quantity ?? args.amount;
          const newQuantity = typeof rawNewQuantity === 'string' ? parseInt(rawNewQuantity, 10) : (rawNewQuantity ?? 0);
          if (!brand || !model) {
            throw new Error('Missing brand or model for update_battery_quantity');
          }
          await updateBatteryQuantity(brand, model, newQuantity);
          return `The quantity for battery ${brand} ${model} has been updated to ${newQuantity}.`;
        }
      case 'get_inventory':
        if (batteries.length === 0) {
          return "The inventory is empty.";
        }
        return `Here is the current inventory:\n${batteries.map(b => `- ${b.brand} ${b.model} (${b.type}): ${b.quantity * b.packSize}`).join('\n')}`;
      case 'export_csv':
        handleExport();
        return 'The inventory has been exported to CSV.';
      case 'generate_report':
        handleGenerateReport(functionCall.args.outputType as 'print' | 'download');
        return 'The report has been generated.';
      default:
        console.warn('Unknown command:', functionCall.name);
        return null;
    }
  };

  const clearChat = () => {
    setHistory([]);
    setMessage('');
    setStreamingMessage(null);
    setStatus('idle');
    setCurrentTool(null);
  };

  const handleSendMessage = async (userMessage: string, currentHistory?: Content[], isRecursiveCall = false) => {
    if (!userMessage && !currentHistory) return;

    if (userMessage) {
      setMessageHistory(prev => [userMessage, ...prev]);
      setHistoryIndex(-1);
    }

    const historyToSend: Content[] = currentHistory || [...history, { role: 'user', parts: [{ text: userMessage || '' }], timestamp: Date.now() }];
    if (!currentHistory) {
      setHistory(historyToSend);
      setMessage('');
    }
    if (!isRecursiveCall) {
      setStatus('thinking');
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: historyToSend }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      const functionCalls: FunctionCall[] = [];

      setStreamingMessage('');

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (fullResponse) {
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: fullResponse }], timestamp: Date.now() }]);
          }
          setStreamingMessage(null);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; 

        for (const line of lines) {
            if (line.trim() === '') continue;
            try {
                const chunkJson = JSON.parse(line);

                if (chunkJson.text) {
                    fullResponse += chunkJson.text;
                    setStreamingMessage(fullResponse);
                }
                if (chunkJson.functionCalls) {
                    for (const fc of chunkJson.functionCalls) {
                        functionCalls.push(fc);
                    }
                }
            } catch (e) {
                console.error("Error parsing JSON line: ", line, e);
            }
        }
      }

      if (functionCalls.length > 0) {
        setStatus('tool_usage');
        const toolOutputs = [];
        for (const call of functionCalls) {
          setCurrentTool(call.name || null);
          const output = await executeCommand(call);
          toolOutputs.push({ functionResponse: { name: call.name, response: { content: output } } });
        }
        const newHistory: Content[] = [...historyToSend, { role: 'model', parts: [{ functionCall: functionCalls[0] }], timestamp: Date.now() }, { role: 'tool', parts: toolOutputs.map(toolOutput => ({ functionResponse: toolOutput.functionResponse })), timestamp: Date.now() }];
        setHistory(newHistory);
        console.log("New history after tool execution:", newHistory);
        // Resend to the model automatically after tool execution
        await handleSendMessage('', newHistory, true);
      } else {
        setStatus('idle');
      }

    } catch (error) {
      console.error('Error sending message to AI:', error);
      setHistory(prev => [...prev, { role: 'model', parts: [{ text: 'Sorry, an unexpected error occurred.' }], timestamp: Date.now() }]);
      setStatus('idle');
    }
  };

  const StatusIndicator = ({ status, tool }: { status: 'thinking' | 'tool_usage', tool: string | null }) => {
    let text = '';
    let icon = null;

    if (status === 'thinking') {
        text = t('chat:thinking');
    } else if (status === 'tool_usage') {
        text = t('chat:using_tools');
        if (tool) {
            switch (tool) {
                case 'add_battery':
                    icon = <Plus className="h-5 w-5 mr-2" />;
                    text = t('chat:adding_battery');
                    break;
                case 'export_csv':
                    icon = <FileUp className="h-5 w-5 mr-2" />;
                    text = t('chat:exporting_csv');
                    break;
                case 'generate_report':
                    icon = <FileDown className="h-5 w-5 mr-2" />;
                    text = t('chat:generating_report');
                    break;
                case 'update_battery_quantity':
                    icon = <Pencil className="h-5 w-5 mr-2" />;
                    text = t('chat:updating_quantity');
                    break;
                default:
                    break;
            }
        }
    }

    return (
        <div className='flex justify-start'>
            <div className='rounded-lg bg-accent p-2 text-accent-foreground flex items-center'>
                {icon || <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2'></div>}
                {text}
            </div>
        </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('chat:ai_manager')}</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={clearChat}
          className='hover:bg-destructive/90 hover:text-destructive-foreground'
          title={t('chat:clear_chat')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='min-h-[16rem] max-h-[32rem] overflow-y-auto rounded-md border p-4 relative'>
            <div className='space-y-1 pt-8'>
              {history.map((chat, index) => (
                <div key={index} className="animate-blur-in animate-fade-in-up">
                  {chat.role === 'user' && chat.parts && (
                    <div className='flex flex-col items-end gap-1'>
                      <div className='rounded-lg bg-blue-500 p-3 text-white hover:bg-blue-600 transition-colors break-words'>
                        {chat.parts[0].text}
                      </div>
                      <span className='text-xs text-muted-foreground'>
                                                {new Date(chat.timestamp || 0).toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  {/* Render the thinking indicator inline right after the last user message */}
                  {index === lastUserIndex && status === 'thinking' && (
                    <div className='flex flex-col items-start gap-1'>
                      <div className='w-[30%] rounded-lg bg-accent p-2 flex items-center justify-between'>
                        <div className='flex items-center'>
                          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2' />
                          <div className='text-sm'>{t('chat:composing_response')}</div>
                        </div>
                        <div className='flex items-center'>
                          <button
                            onClick={() => setThinkingCollapsed(prev => !prev)}
                            className='p-1 rounded hover:bg-accent/20'
                            aria-label={thinkingCollapsed ? t('chat:expand_thinking') : t('chat:collapse_thinking')}
                          >
                            {thinkingCollapsed ? <ChevronDown className='h-4 w-4' /> : <ChevronUp className='h-4 w-4' />}
                          </button>
                        </div>
                      </div>
                      {!thinkingCollapsed && (
                        <div className='rounded-b-lg bg-accent/70 p-2 text-sm text-accent-foreground'>
                          {t('chat:model_generating_answer')}
                        </div>
                      )}
                    </div>
                  )}

                  {chat.role === 'model' && chat.parts && (
                    // Only render model text responses. If the model only issued a functionCall (no text), skip rendering.
                    (typeof (chat.parts[0] as { text?: string })?.text === 'string') ? (
                      <div className='flex flex-col items-start gap-1'>
                        <div className='w-[70%] rounded-lg bg-accent p-3 text-accent-foreground hover:bg-accent/90 transition-colors break-words'>
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                            {(chat.parts[0] as { text?: string }).text as string}
                          </ReactMarkdown>
                        </div>
                        <span className='text-xs text-muted-foreground'>
                                                  {new Date(chat.timestamp || 0).toLocaleTimeString()}
                        </span>
                      </div>
                    ) : null
                  )}

                  {chat.role === 'tool' && chat.parts && (
                    <div className='flex flex-col items-start gap-1'>
                      {chat.parts.map((p, pi) => {
                        const fr = (p as { functionResponse?: { name?: string; response?: { content?: string } } }).functionResponse;
                        if (!fr || fr.name === 'get_inventory') return null;
                        const content = fr.response?.content ?? fr.response ?? '';
                        const name = fr.name ?? 'tool';
                        const key = `${index}-${pi}-${name}`;
                        const collapsed = openTool !== key;

                        const getIconForTool = (toolName: string | undefined) => {
                          switch (toolName) {
                            case 'add_battery':
                              return <Plus className="h-5 w-5 mr-2" />;
                            case 'export_csv':
                              return <FileUp className="h-5 w-5 mr-2" />;
                            case 'generate_report':
                              return <FileDown className="h-5 w-5 mr-2" />;
                            case 'update_battery_quantity':
                              return <Pencil className="h-5 w-5 mr-2" />;
                            default:
                              return <div className='h-5 w-5 mr-2 rounded-full bg-gray-400' />;
                          }
                        };

                        return (
                          <div key={pi} className='w-[100%]'>
                            <div className='w-[50%] flex items-center justify-between rounded-full bg-muted p-2'>
                              <div className='flex items-center'>
                                {getIconForTool(name)}
                                <div className='font-semibold'>
                                  {name}
                                </div>
                              </div>
                              <button
                                onClick={() => handleToolToggle(key)}
                                className='p-1 rounded hover:bg-accent/20'
                                aria-label={collapsed ? t('chat:expand_tool_response') : t('chat:collapse_tool_response')}
                              >
                                {collapsed ? <ChevronDown className='h-4 w-4' /> : <ChevronUp className='h-4 w-4' />}
                              </button>
                            </div>

                            {!collapsed && (
                              <div className='w-[50%] rounded-full bg-muted p-3 text-muted-foreground hover:bg-muted/90 transition-colors break-words'>
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                                  {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {streamingMessage && (
                <div className='flex flex-col items-start gap-1 animate-fade-in'>
                  <div className='rounded-lg bg-accent p-3 text-accent-foreground'>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                      {streamingMessage}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              {(status === 'thinking' || status === 'tool_usage') && 
                <StatusIndicator status={status} tool={currentTool} />
              }
            </div>
            <div ref={chatEndRef} />
          </div>
          <div className='flex space-x-2'>
            <TextareaAutosize
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('chat:type_message')}
              className='w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
              minRows={1}
              maxRows={5}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && message) {
                  e.preventDefault();
                  handleSendMessage(message);
                } else if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && e.shiftKey)) {
                  e.preventDefault();
                  setMessage(prev => prev + '\n');
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  if (historyIndex < messageHistory.length - 1) {
                    const newIndex = historyIndex + 1;
                    setHistoryIndex(newIndex);
                    setMessage(messageHistory[newIndex]);
                  }
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  if (historyIndex > 0) {
                    const newIndex = historyIndex - 1;
                    setHistoryIndex(newIndex);
                    setMessage(messageHistory[newIndex]);
                  } else if (historyIndex === 0) {
                    setHistoryIndex(-1);
                    setMessage('');
                  }
                }
              }}
              disabled={status !== 'idle'}
            />
            <Button 
              onClick={() => {
                if (message) {
                  handleSendMessage(message);
                }
              }}
              disabled={!message || status !== 'idle'}
              className='gap-2'
            >
              <Send className="h-4 w-4" />
              {t('chat:send')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
