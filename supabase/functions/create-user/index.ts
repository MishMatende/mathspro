import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // ========================================
  // CORS
  // ========================================

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    console.log("FUNCTION STARTED");

    // ========================================
    // PARSE REQUEST
    // ========================================

    let body;

    try {
      body = await req.json();
    } catch (e) {
      console.error("INVALID JSON:", e);

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
        },
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

    // ========================================
    // SUPABASE ADMIN CLIENT
    // ========================================

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // ========================================
    // CREATE AUTH USER
    // ========================================

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
      console.error("AUTH CREATION ERROR:", authError);

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
        },
      );
    }

    const userId = authData.user.id;

    console.log("AUTH USER CREATED:", userId);

    // ========================================
    // INSERT PROFILE
    // ========================================

    const { error: profileError } = await supabase.from("profiles").insert([
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

    // ========================================
    // PROFILE FAILED → ROLLBACK AUTH USER
    // ========================================

    if (profileError) {
      console.error("PROFILE CREATION FAILED:", profileError);

      console.log(`Rolling back auth user ${userId}...`);

      const { error: deleteUserError } =
        await supabase.auth.admin.deleteUser(userId);

      if (deleteUserError) {
        console.error(
          "CRITICAL: FAILED TO ROLLBACK AUTH USER:",
          deleteUserError,
        );
      } else {
        console.log(`Auth user ${userId} successfully rolled back.`);
      }

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
        },
      );
    }

    console.log("PROFILE CREATED:", userId);

    // ========================================
    // STUDENT CHECKLIST
    // ========================================

    if (role === "student") {
      const { data: checklist, error: checklistError } = await supabase
        .from("checklist_levels")
        .insert({
          learner_id: userId,
          name: name ? `${name} Checklist` : "Learner Checklist",
          sort_order: 0,
        })
        .select("id")
        .single();

      if (checklistError) {
        console.error("CHECKLIST CREATION ERROR:", checklistError);

        // ----------------------------------------
        // Roll back profile + auth user
        // ----------------------------------------

        const { error: deleteProfileError } = await supabase
          .from("profiles")
          .delete()
          .eq("id", userId);

        if (deleteProfileError) {
          console.error("FAILED TO ROLLBACK PROFILE:", deleteProfileError);
        }

        const { error: deleteUserError } =
          await supabase.auth.admin.deleteUser(userId);

        if (deleteUserError) {
          console.error(
            "CRITICAL: FAILED TO ROLLBACK AUTH USER:",
            deleteUserError,
          );
        }

        return new Response(
          JSON.stringify({
            error: checklistError.message,
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      // ----------------------------------------
      // Assign checklist to learner
      // ----------------------------------------

      if (checklist?.id) {
        const { error: assignmentError } = await supabase
          .from("learner_checklists")
          .upsert(
            {
              learner_id: userId,
              level_id: checklist.id,
            },
            {
              onConflict: "learner_id",
            },
          );

        if (assignmentError) {
          console.error("CHECKLIST ASSIGNMENT ERROR:", assignmentError);

          // ----------------------------------------
          // Roll back checklist
          // ----------------------------------------

          const { error: deleteChecklistError } = await supabase
            .from("checklist_levels")
            .delete()
            .eq("id", checklist.id);

          if (deleteChecklistError) {
            console.error(
              "FAILED TO ROLLBACK CHECKLIST:",
              deleteChecklistError,
            );
          }

          // ----------------------------------------
          // Roll back profile
          // ----------------------------------------

          const { error: deleteProfileError } = await supabase
            .from("profiles")
            .delete()
            .eq("id", userId);

          if (deleteProfileError) {
            console.error("FAILED TO ROLLBACK PROFILE:", deleteProfileError);
          }

          // ----------------------------------------
          // Roll back auth user
          // ----------------------------------------

          const { error: deleteUserError } =
            await supabase.auth.admin.deleteUser(userId);

          if (deleteUserError) {
            console.error(
              "CRITICAL: FAILED TO ROLLBACK AUTH USER:",
              deleteUserError,
            );
          }

          return new Response(
            JSON.stringify({
              error: assignmentError.message,
            }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            },
          );
        }
      }
    }

    // ========================================
    // SUCCESS
    // ========================================

    console.log("SUCCESS:", userId);

    return new Response(
      JSON.stringify({
        success: true,
        userId,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.error("FATAL ERROR:", err);

    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
