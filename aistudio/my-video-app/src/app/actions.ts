'use server'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

export async function refinePrompt(roughIdea: string): Promise<ActionResult<string>> {
    try {
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        if (!OPENROUTER_API_KEY) {
            return { success: false, error: "Server config error: OPENROUTER_API_KEY not set" };
        }

        const system_msg =
            "You write concise, vivid prompts for text-to-video AI models. " +
            "Given a rough idea, output ONE refined prompt (2-3 sentences max) " +
            "describing subject, setting, camera movement, and mood. " +
            "Only use original/generic subjects — never copyrighted characters " +
            "or real public figures. Output only the prompt, no preamble.";

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [
                    { role: "system", content: system_msg },
                    { role: "user", content: roughIdea },
                ],
                max_tokens: 150,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            return { success: false, error: `OpenRouter API ${response.status}: ${errorBody}` };
        }

        const data = await response.json();
        return { success: true, data: data.choices[0].message.content.trim() };
    } catch (err) {
        return { success: false, error: `Prompt refinement failed: ${err instanceof Error ? err.message : String(err)}` };
    }
}

export async function generateVideo(prompt: string): Promise<ActionResult<string>> {
    try {
        const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
        if (!NVIDIA_API_KEY) {
            return { success: false, error: "Server config error: NVIDIA_API_KEY not set" };
        }

        const invokeUrl = "https://ai.api.nvidia.com/v1/cosmos/nvidia/cosmos-1.0-7b-diffusion-text2world";
        const statusUrl = "https://api.nvcf.nvidia.com/v2/nvcf/pexec/status/";

        const payload = {
            inputs: [
                {
                    name: "text2world",
                    shape: [1],
                    datatype: "BYTES",
                    data: [`text2world --prompt="${prompt}"`],
                },
            ],
            outputs: [
                {
                    name: "status",
                    datatype: "BYTES",
                    shape: [1],
                },
            ],
        };

        const sessionHeaders = {
            "Authorization": `Bearer ${NVIDIA_API_KEY}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
        };

        const response = await fetch(invokeUrl, {
            method: "POST",
            headers: sessionHeaders,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            return { success: false, error: `NVIDIA API ${response.status}: ${errorBody}` };
        }

        let result = response;
        let attempts = 0;
        const maxAttempts = 60;

        while (result.status === 202 && attempts < maxAttempts) {
            const requestId = result.headers.get("NVCF-REQID");
            if (!requestId) {
                return { success: false, error: "No NVCF-REQID header in NVIDIA response" };
            }

            await new Promise((resolve) => setTimeout(resolve, 5000));
            result = await fetch(statusUrl + requestId, {
                method: "GET",
                headers: sessionHeaders,
            });

            if (!result.ok) {
                const errorBody = await result.text();
                return { success: false, error: `NVIDIA polling error ${result.status}: ${errorBody}` };
            }
            attempts++;
        }

        if (result.status === 202) {
            return { success: false, error: "Video generation timed out after 5 minutes" };
        }

        const data = await result.json();

        if (data.video) {
            return { success: true, data: data.video };
        }

        if (data.b64_video) {
            return { success: true, data: `data:video/mp4;base64,${data.b64_video}` };
        }

        if (data.video_url) {
            return { success: true, data: data.video_url };
        }

        return { success: false, error: "Unexpected NVIDIA response: " + JSON.stringify(Object.keys(data)) };
    } catch (err) {
        return { success: false, error: `Video generation failed: ${err instanceof Error ? err.message : String(err)}` };
    }
}
