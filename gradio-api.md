API name: /run_inference  
Runs a single turn of inference and yields the output stream for a gr.Chatbot. This function is now a generator.

```js
import { Client } from "@gradio/client";

const response_0 = await fetch("https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png");
const exampleImage = await response_0.blob();

const response_1 = await fetch("undefined");
const exampleVideo = await response_1.blob();

const client = await Client.connect("AIDC-AI/ovis2.5-9B");
const result = await client.predict("/run_inference", {
    chatbot: [["Hello!", null]],
    image_input: exampleImage,
    video_input: exampleVideo,
    do_sample: true,
    max_new_tokens: 256,
    enable_thinking: true,
    enable_thinking_budget: true,
    thinking_budget: 128,
});

console.log(result.data);
````

---

### Accepts 8 parameters:

**chatbot**
*Default: \[]*
The input value that is provided in the "Ovis" Chatbot component. null

**image\_input**
*Blob | File | Buffer* **Required**
The input value that is provided in the "Image Input" Image component. For input, either path or url must be provided. For output, path is always provided.

**video\_input**
*any* **Required**
The input value that is provided in the "Video Input" Video component. null

**do\_sample**
*Boolean*
*Default: True*
The input value that is provided in the "Enable Sampling (Do Sample)" Checkbox component.

**max\_new\_tokens**
*number*
*Default: 2048*
The input value that is provided in the "Max New Tokens" Slider component.

**enable\_thinking**
*Boolean*
*Default: True*
The input value that is provided in the "Enable Deep Thinking" Checkbox component.

**enable\_thinking\_budget**
*Boolean*
*Default: True*
The input value that is provided in the "Enable Thinking Budget" Checkbox component.

**thinking\_budget**
*number*
*Default: 1024*
The input value that is provided in the "Thinking Budget" Slider component.

---

### Returns 1 element

The output value that appears in the "Ovis" Chatbot component.