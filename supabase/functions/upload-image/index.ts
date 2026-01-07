import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const IMGBB_API_KEY = Deno.env.get("IMGBB_API_KEY");
    if (!IMGBB_API_KEY) {
      console.error("IMGBB_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "ImgBB API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { image } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Image = image.includes(",") ? image.split(",")[1] : image;

    console.log("Uploading image to ImgBB...");

    const formData = new FormData();
    formData.append("key", IMGBB_API_KEY);
    formData.append("image", base64Image);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("ImgBB API error:", data);
      return new Response(
        JSON.stringify({ error: data.error?.message || "Failed to upload image" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Image uploaded successfully:", data.data.url);

    return new Response(
      JSON.stringify({
        url: data.data.url,
        delete_url: data.data.delete_url,
        display_url: data.data.display_url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    const message = error instanceof Error ? error.message : "Failed to upload image";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
