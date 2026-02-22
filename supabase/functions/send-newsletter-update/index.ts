import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const chunk = <T>(arr: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
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

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("NEWSLETTER_FROM_EMAIL") ?? "Odipo Newsletter <onboarding@resend.dev>";
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://odipocodero.com";

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Missing function secret: RESEND_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const type = String(body?.type ?? "").trim();
    const title = String(body?.title ?? "").trim();
    const summary = String(body?.summary ?? "").trim();
    const linkPath = String(body?.linkPath ?? "").trim();
    const dedupeKey = String(body?.dedupeKey ?? "").trim();

    if (!type || !title || !linkPath || !dedupeKey) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(sbUrl, sbServiceRoleKey);

    const jwt = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdminRow, error: adminErr } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminErr) {
      return new Response(JSON.stringify({ error: adminErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const role = (user.app_metadata as Record<string, unknown> | null)?.role;
    const isAdminByRole = String(role ?? "") === "admin";
    if (!isAdminRow && !isAdminByRole) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: logError } = await supabase
      .from("newsletter_dispatch_log")
      .insert({
        dedupe_key: dedupeKey,
        entity_type: type,
        entity_title: title,
        link_path: linkPath,
      });

    if (logError && logError.code === "23505") {
      return new Response(JSON.stringify({ ok: true, deduped: true, sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (logError) {
      return new Response(JSON.stringify({ error: logError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .order("created_at", { ascending: true });

    if (subError) {
      return new Response(JSON.stringify({ error: subError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emails = (subscribers ?? [])
      .map((r: any) => String(r.email ?? "").trim().toLowerCase())
      .filter((e) => e.length > 3);

    if (emails.length === 0) {
      return new Response(JSON.stringify({ ok: true, deduped: false, sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subjectMap: Record<string, string> = {
      book: `New book available: ${title}`,
      blog: `New blog post: ${title}`,
      event: `New event: ${title}`,
    };

    const subject = subjectMap[type] ?? `New update: ${title}`;
    const safePath = linkPath.startsWith("/") ? linkPath : `/${linkPath}`;
    const link = `${siteUrl.replace(/\/$/, "")}${safePath}`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.5; color:#111;">
        <h2 style="margin:0 0 10px;">${title}</h2>
        ${summary ? `<p style="margin:0 0 14px;">${summary}</p>` : ""}
        <p style="margin:0 0 16px;">A new ${type} has just been published.</p>
        <a href="${link}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;font-weight:bold;">View Update</a>
      </div>
    `;

    let sent = 0;
    const batches = chunk(emails, 50);
    for (const b of batches) {
      const payload = {
        from: fromEmail,
        to: b,
        subject,
        html,
      };

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resendRes.ok) {
        const raw = await resendRes.text();
        return new Response(JSON.stringify({ error: raw || `Resend failed (${resendRes.status})`, sent }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      sent += b.length;
    }

    return new Response(JSON.stringify({ ok: true, deduped: false, sent }), {
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
