import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface CreateBookBody {
  title: string;
  synopsis: string;
  priceKes: number;
  status: string;
  publishedDate?: string;
  isFeatured?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
      return new Response(
        JSON.stringify({ error: "Missing function secrets: SB_URL and/or SB_SERVICE_ROLE_KEY" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      sbUrl,
      sbServiceRoleKey
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = req.headers.get("content-type");
    if (!contentType?.startsWith("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Expected multipart/form-data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("cover") as File;
    const title = formData.get("title") as string;
    const synopsis = formData.get("synopsis") as string;
    const priceKes = Number(formData.get("priceKes"));
    const status = formData.get("status") as string;
    const publishedDate = formData.get("publishedDate") as string;
    const isFeatured = formData.get("isFeatured") === "true";

    if (!title || !synopsis || isNaN(priceKes) || !status) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let coverPath: string | null = null;
    let coverUrl: string | null = null;

    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        return new Response(JSON.stringify({ error: "Unsupported file type. Use JPG, PNG, or WebP." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return new Response(JSON.stringify({ error: "File too large. Max 5MB." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const bookId = crypto.randomUUID();
      const storagePath = `${bookId}/${Date.now()}.${ext}`;

      const tryBuckets = ["BOOK-COVERS", "book-covers"];
      let usedBucket: string | null = null;
      let lastUploadError: string | null = null;

      for (const bucket of tryBuckets) {
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(storagePath, file, { upsert: true, contentType: file.type });

        if (!uploadError) {
          usedBucket = bucket;
          lastUploadError = null;
          break;
        }

        lastUploadError = `${bucket}: ${uploadError.message}`;
      }

      if (!usedBucket) {
        return new Response(JSON.stringify({ error: `Storage upload failed. ${lastUploadError ?? ''}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data } = supabase.storage.from(usedBucket).getPublicUrl(storagePath);
      coverPath = storagePath;
      coverUrl = data.publicUrl;
    }

    const { data: bookData, error: insertError } = await supabase
      .from("books")
      .insert({
        title,
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        synopsis,
        price_kes: priceKes,
        status,
        published_date: publishedDate ? publishedDate : null,
        is_featured: isFeatured,
        cover_path: coverPath,
        cover_url: coverUrl,
      })
      .select("*")
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ book: bookData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
