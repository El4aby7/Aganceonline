import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, description, details } = await req.json();

    if (!name && !description) {
      throw new Error("No text provided to translate.");
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY environment variable not set.");
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional automotive translator. Translate the provided JSON object (containing 'name', 'description', and 'details') into Arabic. Return ONLY the JSON object with keys: 'name_ar', 'description_ar', and 'details_ar' (which should contain translated mileage, transmission, fuel strings). maintain the original structure."
          },
          {
            role: "user",
            content: JSON.stringify({ name, description, details })
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(`OpenAI Error: ${data.error.message}`);
    }

    const translatedContent = data.choices[0].message.content;

    // Attempt to parse the JSON returned by OpenAI
    let resultJson;
    try {
        resultJson = JSON.parse(translatedContent);
    } catch (e) {
        // Fallback if OpenAI returns markdown block or extra text
        const jsonMatch = translatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            resultJson = JSON.parse(jsonMatch[0]);
        } else {
             throw new Error("Failed to parse AI response as JSON.");
        }
    }

    return new Response(JSON.stringify(resultJson), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
