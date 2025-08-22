"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Client } from "@gradio/client";
import { Battery } from "@/lib/types";

const systemPrompt = `
You are an AI assistant for the Battery Buddy application. You can help users manage their battery inventory.

You have access to the following commands:

- add_battery(data: { brand: string, model: string, type: string, quantity: number, packSize: number }): Adds a new battery to the inventory.
- delete_battery(id: string): Deletes a battery from the inventory.
- update_battery(data: { id: string, brand?: string, model?: string, type?: string, quantity?: number, packSize?: number }): Updates a battery in the inventory.
- get_inventory(): Returns the entire battery inventory.
- export_csv(): Exports the current inventory to a CSV file.
- generate_report(outputType: "print" | "download"): Generates a report of the inventory.

When the user asks you to perform an action, you should respond with a JSON object containing the command and its parameters. For example:

User: "add a new AA battery from Panasonic"
AI:
{
  "command": "add_battery",
  "parameters": {
    "brand": "Panasonic",
    "type": "AA",
    "model": "Eneloop",
    "quantity": 1,
    "packSize": 4
  }
}

If you need more information from the user, you can ask for it. For example, if the user says "add a new battery", you can ask for the brand, model, type, etc.

You can also answer general questions about the battery inventory.
`;

interface AiManagerProps {
  addBattery: (data: Battery) => Promise<void>;
  deleteBattery: (id: string) => Promise<void>;
  updateBattery: (data: Battery) => Promise<void>;
  handleExport: () => void;
  handleGenerateReport: (outputType: "print" | "download") => void;
  batteries: Battery[];
}

export function AiManager({ 
  addBattery,
  deleteBattery,
  updateBattery,
  handleExport,
  handleGenerateReport,
  batteries
}: AiManagerProps) {
  const [chatbot, setChatbot] = useState<[string, string | null][]>([]);
  const [message, setMessage] = useState("");

  const parseAIResponse = (response: string) => {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Error parsing JSON from AI response:", error);
      return null;
    }
  };

  interface Command {
  command: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: any;
}

  const executeCommand = (command: Command) => {
    if (!command || !command.command) return;

    switch (command.command) {
      case "add_battery":
        addBattery(command.parameters);
        break;
      case "delete_battery":
        deleteBattery(command.parameters.id);
        break;
      case "update_battery":
        updateBattery(command.parameters);
        break;
      case "get_inventory":
        setChatbot([...chatbot, ["Here is your inventory:", JSON.stringify(batteries, null, 2)]]);
        break;
      case "export_csv":
        handleExport();
        break;
      case "generate_report":
        handleGenerateReport(command.parameters.outputType);
        break;
      default:
        console.warn("Unknown command:", command.command);
    }
  };

  const handleSendMessage = async () => {
    if (!message) return;

    const newChatbot: [string, string | null][] = [
      [systemPrompt, null],
      ...chatbot,
      [message, null],
    ];
    setChatbot(newChatbot);
    setMessage("");

    try {
      const client = await Client.connect("AIDC-AI/ovis2.5-9B");
      const result = await client.predict("/run_inference", {
        chatbot: newChatbot,
        do_sample: true,
        max_new_tokens: 1024,
        enable_thinking: true,
        enable_thinking_budget: true,
        thinking_budget: 128,
      });

      // @ts-expect-error - The Gradio client returns a response with a data property that is an array containing the chat history.
      const response = result.data[0];
      const updatedChatbot = response;
      setChatbot(updatedChatbot);

      const lastResponse = updatedChatbot[updatedChatbot.length - 1][1];
      if (lastResponse) {
        const command = parseAIResponse(lastResponse);
        if (command) {
          executeCommand(command);
        }
      }

    } catch (error) {
      console.error("Error sending message to AI:", error);
      // Handle error appropriately in the UI
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-64 overflow-y-auto rounded-md border p-4">
            {chatbot.map((chat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-end">
                  <div className="rounded-lg bg-blue-500 p-2 text-white">
                    {chat[0]}
                  </div>
                </div>
                {chat[1] && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-gray-200 p-2 text-gray-800">
                      {chat[1]}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}