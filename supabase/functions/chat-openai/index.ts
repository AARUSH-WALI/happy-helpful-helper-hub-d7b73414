import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, user_context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const openAIApiKey = Deno.env.get('OpenAiKey');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Build the system prompt for Cooksy
    const systemPrompt = `You are Cooksy AI, an expert culinary assistant and professional chef with extensive knowledge in:

🍳 COOKING EXPERTISE:
- International cuisines and traditional recipes
- Advanced cooking techniques and food science
- Ingredient substitutions and dietary adaptations
- Kitchen equipment recommendations and usage
- Food safety and proper storage methods
- Meal planning and nutrition optimization
- Baking science and pastry techniques
- Wine pairing and beverage recommendations

🎯 RESPONSE STYLE:
- Provide step-by-step instructions with precise measurements
- Include cooking times, temperatures, and techniques
- Suggest ingredient alternatives for dietary restrictions
- Offer helpful tips and pro chef secrets
- Be encouraging and enthusiastic about cooking
- Format recipes clearly with ingredients and instructions
- Include nutritional benefits when relevant
- Keep responses conversational and engaging
- For recipes, use clear numbering and formatting

🧑‍🍳 USER CONTEXT:
${user_context ? `User preferences: ${JSON.stringify(user_context)}` : 'No specific user preferences available.'}

Focus on cooking, food, recipes, kitchen techniques, meal planning, and culinary arts. If asked about non-cooking topics, politely redirect to culinary assistance.`;

    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    console.log('Sending request to OpenAI with messages:', openAIMessages.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        temperature: 0.8,
        max_tokens: 2048,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('No response from OpenAI');
    }

    console.log('Successfully generated response from OpenAI');

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-openai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});