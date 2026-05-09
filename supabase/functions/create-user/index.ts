// supabase/functions/create-user/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // ✅ CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    console.log("FUNCTION STARTED");

    // ✅ Parse safely
    let body;

    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON body",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("BODY:", body);

    const {
      role,
      name,
      email,

      curriculum,
      level,
      phone,
      parentEmail1,
      parentEmail2,

      tscNumber,
      phone1,
      phone2,
      teachingAreas,
    } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ✅ Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          role,
          name,
        },
      });

    console.log("AUTH RESPONSE:", authData);

    if (authError) {
      console.log(authError);

      return new Response(
        JSON.stringify({
          error: authError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userId = authData.user.id;

    // ✅ Insert profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          role,
          name,
          email,

          curriculum,
          level,
          phone,

          parent_email_1: parentEmail1,
          parent_email_2: parentEmail2,

          tsc_number: tscNumber,
          phone_1: phone1,
          phone_2: phone2,
          teaching_areas: teachingAreas,
        },
      ]);

    if (profileError) {
      console.log(profileError);

      return new Response(
        JSON.stringify({
          error: profileError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("SUCCESS");

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.log("FATAL ERROR:", err);

    return new Response(
      JSON.stringify({
        error: String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});