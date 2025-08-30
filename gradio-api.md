### Step 1: Installation ⚙️

This step remains the same. If you haven't already, install the **@gradio/client** library in your project.

```bash
npm install @gradio/client
```

-----

### Step 2: Create a Backend Route

This new method requires multiple API calls to work because it's stateful. First, you send the message to set the state, then you trigger a separate function to get the response.

Replace the code in **`app/api/chat/route.ts`** with the following. This new version performs the essential two-step sequence.

```typescript
// File: app/api/chat/route.ts
import { NextResponse } from "next/server";
import { client } from "@gradio/client";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Connect to the Gradio app space
    const app = await client("smd/gpt-oss-120b-chatbot");

    // STEP 1: Set the user's message in the textbox.
    // This call updates the state on the backend.
    await app.predict("/clear_and_save_textbox", {
      message: message,
    });

    // STEP 2: Trigger the submit function to get the bot's response.
    // We provide sensible defaults for the parameters.
    const result = await app.predict("/submit_fn", {
      system_prompt: "You are a helpful assistant.",
      temperature: 0.7,
      reasoning_effort: "eedivs", 
      enable_browsing: false,
    });

    // The response data is often a representation of the chat history.
    // We assume the final message in the history is the assistant's reply.
    // The actual data structure might vary.
    const chatHistory = result.data[0];
    const latestResponse = chatHistory[chatHistory.length - 1];
    const assistantMessage = latestResponse[1]; // Assuming [user, assistant] pairs

    // Send the extracted response back to your frontend
    return NextResponse.json({ response: assistantMessage });

  } catch (error) {
    console.error("API call failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
```

### A Note on This Method

This approach mimics the internal workings of the UI and can be less stable than using a single, dedicated API endpoint. The main takeaway is that you often need to **find the essential functions** (`clear_and_save_textbox` and `submit_fn` in this case) and call them in the correct order.

-----

### Step 3: Build the Frontend Interface 🖥️

**No changes are needed here\!** Your frontend code from **`app/page.tsx`** will work perfectly. It doesn't need to know about the complexity on the backend; it just sends a message to your `/api/chat` route and displays whatever response it gets back.

-----

### Step 4: Run Your App

You're ready to go. Start the development server from your terminal:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser to use the chat interface. It will now use the more complex, multi-step API calling method on the backend.