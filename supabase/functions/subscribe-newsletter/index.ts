import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const sendEmail = async (apiKey: string, from: string, to: string, subject: string, html: string) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!res.ok) {
    const raw = await res.text();
    throw new Error(`Resend email failed: ${raw || res.status}`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sbUrl = Deno.env.get("SB_URL");
    const sbServiceRoleKey = Deno.env.get("SB_SERVICE_ROLE_KEY");
    if (!sbUrl || !sbServiceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing function secrets: SB_URL and/or SB_SERVICE_ROLE_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(sbUrl, sbServiceRoleKey);

    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({ email });

    if (insertError && insertError.code !== "23505") {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NEWSLETTER_NOTIFY_EMAIL");
    const fromEmail = Deno.env.get("NEWSLETTER_FROM_EMAIL") ?? "Odipo Newsletter <onboarding@resend.dev>";

    let notificationSent = false;
    if (resendApiKey && notifyEmail) {
      try {
        await sendEmail(
          resendApiKey,
          fromEmail,
          notifyEmail,
          "New newsletter subscriber",
          `<p>New subscriber: <strong>${email}</strong></p><p>Time: ${new Date().toISOString()}</p>`
        );

        if (!insertError) {
          await sendEmail(
            resendApiKey,
            fromEmail,
            email,
            "You are subscribed",
            "<p>Thanks for subscribing to Odipo C. Odero updates.</p>"
          );
        }

        notificationSent = true;
      } catch (_e) {
        notificationSent = false;
      }
    }

    if (insertError?.code === "23505") {
      return new Response(JSON.stringify({ ok: true, duplicate: true, notificationSent }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, duplicate: false, notificationSent }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
