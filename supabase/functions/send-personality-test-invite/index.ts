
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to generate a secure random token
function generateToken() {
  return crypto.randomUUID();
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      resumeId, 
      email, 
      name, 
      personalityTestUrl = 'https://placeholder-personality-test.com' 
    } = await req.json();

    // Generate unique token
    const token = generateToken();

    // Store invitation in database using the correct schema
    // Note: We're storing the email directly as per your schema, not a foreign key
    const { data, error: insertError } = await supabase
      .from('personality_test_invitations')
      .insert({
        candidate_email: email,  // Use the actual column name from your schema
        token,
        is_completed: false
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Construct invitation link
    const invitationLink = `${personalityTestUrl}?token=${token}`;

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: 'Candidate Assessment <assessments@yourcompany.com>',
      to: email,
      subject: 'Complete Your Personality Assessment',
      html: `
        <h1>Hello ${name},</h1>
        <p>We invite you to complete a brief personality assessment as part of your job application process.</p>
        <p>Please click the link below to start the test:</p>
        <a href="${invitationLink}">Take the Personality Test</a>
        <p>This link is unique to you and will expire soon.</p>
        <p>Best regards,<br>Your Hiring Team</p>
      `
    });

    if (emailError) throw emailError;

    return new Response(JSON.stringify({ 
      message: 'Invitation sent successfully', 
      invitationId: data.id 
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: 200
    });

  } catch (error) {
    console.error('Error in personality test invite function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: 500
    });
  }
});
