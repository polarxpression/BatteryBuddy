import { GoogleGenAI, Type, FunctionDeclaration, Tool } from "@google/genai";
import { getDailyBatteryRecords, getWeeklyBatteryAverages, getMonthlyBatteryAverages } from "@/lib/firebase";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const ai = new GoogleGenAI({ apiKey });

const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "get_inventory",
    description: "Get the complete storage inventory",
  },
  {
    name: "add_battery",
    description: "Adds a new battery to the inventory.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        brand: { type: Type.STRING },
        model: { type: Type.STRING },
        type: { type: Type.STRING },
        quantity: { type: Type.NUMBER },
        packSize: { type: Type.NUMBER },
      },
      required: ["brand", "model", "type", "quantity", "packSize"],
    },
  },
  {
    name: "export_csv",
    description: "Exports the inventory to a CSV file.",
  },
  {
    name: "generate_report",
    description: "Generates a stock report with custom markdown content. If the historical and weekly averages data is not available, you must inform the user that you were unable to generate the report due to missing data.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        reportContent: { type: Type.STRING, description: "The markdown content for the report." },
      },
      required: ["reportContent"],
    },
  },
  {
    name: "update_battery_quantity",
    description: "Updates the quantity of an existing battery.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        brand: { type: Type.STRING },
        model: { type: Type.STRING },
        newQuantity: { type: Type.NUMBER, description: "The new total quantity of battery packs to set for the battery." },
      },
      required: ["brand", "model", "newQuantity"],
    },
  },
  {
    name: "get_historical_battery_data",
    description: "Retrieves historical daily battery quantity records.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "get_weekly_battery_averages",
    description: "Retrieves weekly average battery quantities.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "get_monthly_battery_averages",
    description: "Retrieves monthly average battery quantities.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];

const tools: Tool[] = [
  {
    functionDeclarations,
  },
];

const systemPrompt = `
You are Battery Buddy, the inventory assistant for a battery management app.

Objective: Help users manage battery inventory accurately by using the provided functions when needed. Prioritize correctness and avoid making assumptions.

Available functions:
- add_battery(brand, model, type, quantity, packSize)
- update_battery_quantity(brand, model, newQuantity)
- get_inventory()
- export_csv()
- generate_report(reportContent: string)
- get_historical_battery_data()
- get_weekly_battery_averages()
- get_monthly_battery_averages()

Strict function-calling rules (must follow):
- When suggesting quantities to buy, prioritize using 
get_monthly_battery_averages() if available, then get_weekly_battery_averages(), and finally get_historical_battery_data() for more granular insights if needed.
- ALWAYS call get_inventory() first before attempting any function that modifies or adds inventory (for example, add_battery or update_battery_quantity). Use the results of get_inventory() to determine whether the item already exists and to avoid creating duplicates.
- After receiving the inventory result, decide:
  - If an exact match for brand+model exists, prefer update_battery_quantity to change quantities rather than creating a duplicate entry.
  - If no matching item exists, call add_battery with the correct parameters.
- If you cannot determine identity from the user's message (missing brand or model), ASK exactly one concise clarifying question and wait for the user's reply before calling any function.
- When calling any function, RETURN only the function call payload (structured for the SDK) and no extra natural-language text in the same response.
- Never call functions not listed above.

Response format and tone:
- For function calls: emit the function call only (structured via the SDK). Do not include extra prose in the same response.
- For conversational replies (no function call): be concise (1–3 short sentences), helpful, and specific.
- When presenting inventory or report data to the user, prefer compact JSON or a short table if the user requests structured output. When you receive the output from the get_inventory tool, you must format it in a user-friendly way, summarizing the inventory in a readable format. Do not simply copy the JSON output.

When you receive the output from the get_historical_battery_data, get_weekly_battery_averages, and get_monthly_battery_averages functions, you will receive a JSON string. You must parse this string to access the data.

Illustrative examples (showing required ordering):
1) User: "Add 12 AA Duracell batteries, pack size 4"
  - Assistant action: CALL get_inventory(); examine results for a Duracell AA entry.
  - If no Duracell AA exists: CALL add_battery({brand:"Duracell", model:"AA", type:"AA", quantity:12, packSize:4})
  - If Duracell AA exists: CALL update_battery_quantity({brand:"Duracell", model:"AA", newQuantity: existingQuantity + 12})

2) User: "Decrease quantity of Acme 9V to 5"
  - Assistant action: CALL get_inventory(); confirm Acme 9V exists.
  - If exists: CALL update_battery_quantity with newQuantity 5.
  - If not found: ASK "I can't find Acme 9V in your inventory — do you want to add it instead?"

  3) User: "Add 1 cartela of 27a from Kapbom"
    - Context: There is an existing inventory item named "27A-12V" from brand "Kapbom" with packSize 5 (each pack contains 5 batteries).
    - Assistant action: CALL get_inventory(); examine results for a Kapbom 27A-12V entry.
    - If an exact match (brand:"Kapbom", model:"27A-12V") exists: CALL update_battery_quantity({brand:"Kapbom", model:"27A-12V", newQuantity: existingQuantity + 1})
      - Note: The user requested to add one pack ("cartela"), so increment the inventory's pack count by 1, not by the number of batteries inside the pack.
    - If not found: CALL add_battery({brand:"Kapbom", model:"27A-12V", type:"27A", quantity:1, packSize:5})

Constraints:
- Do not assume missing fields; ask for them.
- Keep replies concise and avoid extraneous detail unless the user asks for it.

Notes:
- Pack size is how many batteries are in one package (e.g., a pack of 4 AA batteries has packSize 4).
- Cartela is the Portuguese word for pack or blister pack of batteries (e.g., a cartela of 4 AA batteries).
`;

export const dynamic = 'force-dynamic';

let currentModel: 'gemini-2.5-pro' | 'gemini-2.5-flash' = 'gemini-2.5-pro';

import { showErrorToast } from "@/lib/ui";

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    const contents = [...history];
    if (message) {
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });
    }

    try {
      // Use the streaming API and place tools inside the request config per SDK
      const streamIterator = await ai.models.generateContentStream({
        model: currentModel,
        contents,
        config: {
          systemInstruction: systemPrompt,
          tools,
        },
      });

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamIterator) {
              console.log("Received chunk:", JSON.stringify(chunk, null, 2));
              if (chunk.functionCalls) {
                console.log("Detected function calls:", JSON.stringify(chunk.functionCalls, null, 2));
                for (const call of chunk.functionCalls) {
                  if (
                    call.name === "get_historical_battery_data" ||
                    call.name === "get_weekly_battery_averages" ||
                    call.name === "get_monthly_battery_averages"
                  ) {
                    const functionMap = {
                      get_historical_battery_data: getDailyBatteryRecords,
                      get_weekly_battery_averages: getWeeklyBatteryAverages,
                      get_monthly_battery_averages: getMonthlyBatteryAverages,
                    };

                    const selectedFunction = functionMap[call.name as keyof typeof functionMap];
                    const data = await selectedFunction();

                    contents.push({
                      role: "model",
                      parts: [{ functionCall: call }],
                    });
                    contents.push({
                      role: "tool",
                      parts: [{ functionResponse: { name: call.name, response: { content: JSON.stringify(data) } } }],
                    });

                    const newStreamIterator = await ai.models.generateContentStream({
                      model: currentModel,
                      contents,
                      config: {
                        systemInstruction: systemPrompt,
                        tools,
                      },
                    });

                    for await (const newChunk of newStreamIterator) {
                      const data = {
                        text: newChunk.text,
                        functionCalls: newChunk.functionCalls,
                      };
                      controller.enqueue(JSON.stringify(data) + '\n');
                    }
                  } else {
                    const data = {
                      text: chunk.text,
                      functionCalls: chunk.functionCalls,
                    };
                    controller.enqueue(JSON.stringify(data) + '\n');
                  }
                }
              } else {
                const data = {
                  text: chunk.text,
                  functionCalls: chunk.functionCalls,
                };
                controller.enqueue(JSON.stringify(data) + '\n');
              }
            }
          } catch (err) {
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('quota')) {
        currentModel = 'gemini-2.5-flash';
        console.log("Request contents (fallback):", JSON.stringify(contents, null, 2));
        const streamIterator = await ai.models.generateContentStream({
          model: currentModel,
          contents,
          config: {
            systemInstruction: systemPrompt,
            tools,
          },
        });

        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of streamIterator) {
                console.log("Received chunk (fallback):", JSON.stringify(chunk, null, 2));
                if (chunk.functionCalls) {
                  console.log("Detected function calls (fallback):", JSON.stringify(chunk.functionCalls, null, 2));
                  for (const call of chunk.functionCalls) {
                    if (
                      call.name === "get_historical_battery_data" ||
                      call.name === "get_weekly_battery_averages" ||
                      call.name === "get_monthly_battery_averages"
                    ) {
                      const functionMap = {
                        get_historical_battery_data: getDailyBatteryRecords,
                        get_weekly_battery_averages: getWeeklyBatteryAverages,
                        get_monthly_battery_averages: getMonthlyBatteryAverages,
                      };

                      const selectedFunction = functionMap[call.name as keyof typeof functionMap];
                      const data = await selectedFunction();

                      contents.push({
                        role: "model",
                        parts: [{ functionCall: call }],
                      });
                      contents.push({
                        role: "tool",
                        parts: [{ functionResponse: { name: call.name, response: { content: JSON.stringify(data) } } }],
                      });

                      const newStreamIterator = await ai.models.generateContentStream({
                        model: currentModel,
                        contents,
                        config: {
                          systemInstruction: systemPrompt,
                          tools,
                        },
                      });

                      for await (const newChunk of newStreamIterator) {
                        const data = {
                          text: newChunk.text,
                          functionCalls: newChunk.functionCalls,
                        };
                        controller.enqueue(JSON.stringify(data) + '\n');
                      }
                    } else {
                      const data = {
                        text: chunk.text,
                        functionCalls: chunk.functionCalls,
                      };
                      controller.enqueue(JSON.stringify(data) + '\n');
                    }
                  }
                } else {
                  const data = {
                    text: chunk.text,
                    functionCalls: chunk.functionCalls,
                  };
                  controller.enqueue(JSON.stringify(data) + '\n');
                }
              }
            } catch (err) {
              controller.error(err);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error in POST function:", error);
    showErrorToast("An error occurred while processing your request.", () => {
      // Retry logic here
    });
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}