import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (raw: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return toHex(new Uint8Array(digest));
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "GET") {
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

    const url = new URL(req.url);
    const token = String(url.searchParams.get("token") ?? "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(sbUrl, sbServiceRoleKey);
    const token_hash = await sha256Hex(token);

    const { data: access, error: aErr } = await supabase
      .from("purchase_access_tokens")
      .select("id, purchase_id, book_id, email, revoked_at")
      .eq("token_hash", token_hash)
      .maybeSingle();

    if (aErr) {
      return new Response(JSON.stringify({ error: aErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!access) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if ((access as any).revoked_at) {
      return new Response(JSON.stringify({ error: "Token revoked" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bookId = String((access as any).book_id);
    const purchaseId = String((access as any).purchase_id);
    const accessEmail = String((access as any).email ?? "").trim().toLowerCase();

    const { data: purchase, error: purchaseErr } = await supabase
      .from("purchases")
      .select("payment_reference")
      .eq("id", purchaseId)
      .maybeSingle();

    if (purchaseErr) {
      return new Response(JSON.stringify({ error: purchaseErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentReference = String((purchase as any)?.payment_reference ?? "");

    const { data: book, error: bErr } = await supabase
      .from("books")
      .select("pdf_path")
      .eq("id", bookId)
      .maybeSingle();

    if (bErr) {
      return new Response(JSON.stringify({ error: bErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pdf_path = String((book as any)?.pdf_path ?? "");
    if (!pdf_path) {
      return new Response(JSON.stringify({ error: "No PDF uploaded for this book" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: file, error: dErr } = await supabase.storage.from("book-files").download(pdf_path);
    if (dErr) {
      return new Response(JSON.stringify({ error: dErr.message }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    const watermarkEmail = accessEmail.includes("@")
      ? (() => {
          const [local, domain] = accessEmail.split("@");
          const safeLocal = local.length <= 2 ? `${local[0] || ""}*` : `${local.slice(0, 2)}***`;
          return `${safeLocal}@${domain}`;
        })()
      : accessEmail;

    const watermarkRef =
      paymentReference.length > 10
        ? `${paymentReference.slice(0, 6)}...${paymentReference.slice(-4)}`
        : paymentReference;

    const watermarkText = [watermarkEmail, watermarkRef].filter(Boolean).join(" | ") || "Licensed Copy";

    let outputBytes: Uint8Array | ArrayBuffer = bytes;
    try {
      const pdfDoc = await PDFDocument.load(bytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const fontSize = 8;

      for (const page of pages) {
        const { width } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const x = Math.max(12, (width - textWidth) / 2);
        page.drawText(watermarkText, {
          x,
          y: 10,
          size: fontSize,
          font,
          color: rgb(0.25, 0.25, 0.25),
          opacity: 0.55,
        });
      }

      outputBytes = await pdfDoc.save();
    } catch (_watermarkErr) {
      // Some PDFs can fail to re-serialize. Fall back to original bytes so reading still works.
      outputBytes = bytes;
    }

    void supabase
      .from("purchase_access_tokens")
      .update({
        last_viewed_at: new Date().toISOString(),
      })
      .eq("id", (access as any).id);

    return new Response(outputBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=book.pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
