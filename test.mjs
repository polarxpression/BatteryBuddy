import { Client } from "@gradio/client";

const client = await Client.connect("Reubencf/Gemma3-konkani");
const result = await client.predict("/chat", { 		
		message: "Who are you?", 		
		system_message: "You are a helpful assistant", 		
		max_tokens: 1, 		
		temperature: 0.1, 		
		top_k: 0, 		
		top_p: 0.1, 		
		duration: 1, 
});

console.log(result.data);
