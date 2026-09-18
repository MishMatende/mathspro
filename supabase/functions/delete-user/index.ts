import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: "Missing userId",
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

    // Verify caller
    const authHeader = req.headers.get("Authorization");

    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: authHeader ?? "",
          },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return new Response(
        JSON.stringify({
          error: "Admin access required",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Service role client
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const failIfError = (error: { message: string } | null, step: string) => {
      if (error) throw new Error(`${step}: ${error.message}`);
    };

    const deleteWhere = async (
      table: string,
      column: string,
      value: string,
      step: string,
    ) => {
      const { error } = await adminClient
        .from(table)
        .delete()
        .eq(column, value);
      failIfError(error, step);
    };

    const { data: targetProfile, error: targetProfileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    failIfError(targetProfileError, "Could not identify the user being deleted");

    if (targetProfile?.role === "student") {
      await deleteWhere(
        "learner_subtopic_progress",
        "learner_id",
        userId,
        "Could not delete checklist progress",
      );

      const { data: levels, error: levelsError } = await adminClient
        .from("checklist_levels")
        .select("id")
        .eq("learner_id", userId);
      failIfError(levelsError, "Could not load the learner checklist");

      const levelIds = (levels ?? []).map((level) => level.id);
      if (levelIds.length) {
        const { data: topics, error: topicsError } = await adminClient
          .from("checklist_topics")
          .select("id")
          .in("level_id", levelIds);
        failIfError(topicsError, "Could not load checklist topics");

        const topicIds = (topics ?? []).map((topic) => topic.id);
        if (topicIds.length) {
          const { error: subtopicsError } = await adminClient
            .from("checklist_subtopics")
            .delete()
            .in("topic_id", topicIds);
          failIfError(subtopicsError, "Could not delete checklist subtopics");

          const { error: topicsDeleteError } = await adminClient
            .from("checklist_topics")
            .delete()
            .in("id", topicIds);
          failIfError(topicsDeleteError, "Could not delete checklist topics");
        }
      }

      await deleteWhere(
        "learner_checklists",
        "learner_id",
        userId,
        "Could not delete the checklist assignment",
      );
      await deleteWhere(
        "checklist_levels",
        "learner_id",
        userId,
        "Could not delete the learner checklist",
      );
      await deleteWhere(
        "tutor_resource_learner_assignments",
        "learner_id",
        userId,
        "Could not delete resource assignments",
      );
      await deleteWhere(
        "homework_submissions",
        "learner_id",
        userId,
        "Could not delete homework submissions",
      );
      await deleteWhere(
        "homework",
        "learner_id",
        userId,
        "Could not delete homework",
      );
      await deleteWhere("tests", "learner_id", userId, "Could not delete tests");
      await deleteWhere(
        "lessons",
        "learner_id",
        userId,
        "Could not delete lessons",
      );
      await deleteWhere("files", "learner_id", userId, "Could not delete files");
      await deleteWhere("learners", "id", userId, "Could not delete learner");
    } else if (targetProfile?.role === "tutor") {
      await deleteWhere("tutors", "id", userId, "Could not delete tutor");
    }

    await deleteWhere("profiles", "id", userId, "Could not delete profile");

    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw deleteError;
    }

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
      },
    );
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
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
