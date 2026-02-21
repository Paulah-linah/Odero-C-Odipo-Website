import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (raw: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return toHex(new Uint8Array(digest));
};

const randomToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
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
    const reference = String(body?.reference ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!reference || !email) {
      return new Response(JSON.stringify({ error: "Missing reference and/or email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(sbUrl, sbServiceRoleKey);

    const { data: purchase, error: pErr } = await supabase
      .from("purchases")
      .select("id, book_id, buyer_email, status, total_amount")
      .eq("payment_reference", reference)
      .maybeSingle();

    if (pErr) {
      return new Response(JSON.stringify({ error: pErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!purchase) {
      return new Response(JSON.stringify({ error: "Purchase not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const buyerEmail = String((purchase as any).buyer_email ?? "").trim().toLowerCase();
    if (buyerEmail !== email) {
      return new Response(JSON.stringify({ error: "Email does not match purchase" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const status = String((purchase as any).status ?? "");
    if (!(status === "paid" || status === "completed")) {
      const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!paystackSecret) {
        return new Response(JSON.stringify({ error: "Missing function secret: PAYSTACK_SECRET_KEY" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
      });

      const verifyRaw = await verifyRes.text();
      let verifyJson: any = null;
      try {
        verifyJson = verifyRaw ? JSON.parse(verifyRaw) : null;
      } catch {
        verifyJson = null;
      }

      if (!verifyRes.ok || !verifyJson?.status) {
        const msg = verifyJson?.message || "Failed to verify transaction with Paystack";
        return new Response(JSON.stringify({ error: msg }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tx = verifyJson.data ?? {};
      const txStatus = String(tx.status ?? "");
      const txEmail = String(tx?.customer?.email ?? "").trim().toLowerCase();
      const txAmount = Number(tx.amount ?? 0);
      const txBookId = String(tx?.metadata?.book_id ?? "");
      const expectedBookId = String((purchase as any).book_id ?? "");
      const expectedAmount = Number((purchase as any).total_amount ?? 0) * 100;

      if (txStatus !== "success") {
        return new Response(JSON.stringify({ error: "Payment not successful yet" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (txEmail && txEmail !== email) {
        return new Response(JSON.stringify({ error: "Payment email does not match" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (expectedAmount > 0 && txAmount !== expectedAmount) {
        return new Response(JSON.stringify({ error: "Payment amount mismatch" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (txBookId && expectedBookId && txBookId !== expectedBookId) {
        return new Response(JSON.stringify({ error: "Payment metadata mismatch" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: markPaidErr } = await supabase
        .from("purchases")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", String((purchase as any).id));

      if (markPaidErr) {
        return new Response(JSON.stringify({ error: markPaidErr.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const rawToken = randomToken();
    const token_hash = await sha256Hex(rawToken);

    const purchase_id = String((purchase as any).id);
    const book_id = String((purchase as any).book_id);

    const { error: delErr } = await supabase
      .from("purchase_access_tokens")
      .delete()
      .eq("purchase_id", purchase_id);

    if (delErr) {
      return new Response(JSON.stringify({ error: delErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insErr } = await supabase
      .from("purchase_access_tokens")
      .insert({
        purchase_id,
        book_id,
        email,
        token_hash,
      });

    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ token: rawToken }), {
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
