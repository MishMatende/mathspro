import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

serve(async (req) => {
  // --------------------------------------------------
  // CORS
  // --------------------------------------------------

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return json(
      {
        success: false,
        error: "Method not allowed",
      },
      405,
    );
  }

  try {
    console.log("RESET FUNCTION: started");

    // --------------------------------------------------
    // 1. Read request body
    // --------------------------------------------------

    let body;

    try {
      body = await req.json();
    } catch {
      return json(
        {
          success: false,
          error: "Invalid request body",
        },
        400,
      );
    }

    const { email, redirectTo } = body;

    console.log("RESET FUNCTION: request received", {
      email,
      redirectTo,
    });

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof redirectTo !== "string" ||
      !redirectTo.trim()
    ) {
      return json(
        {
          success: false,
          error: "Email and redirect URL are required",
        },
        400,
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRedirectTo = redirectTo.trim();

    // --------------------------------------------------
    // 2. Supabase environment variables
    // --------------------------------------------------

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("RESET FUNCTION: environment check", {
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasSupabaseAnonKey: Boolean(supabaseAnonKey),
      hasServiceRoleKey: Boolean(serviceRoleKey),
      hasResendKey: Boolean(Deno.env.get("RESEND_API_KEY")),
      hasResendFrom: Boolean(Deno.env.get("RESEND_FROM_EMAIL")),
    });

    if (!supabaseUrl) {
      console.error("SUPABASE_URL is missing");

      return json(
        {
          success: false,
          error: "Supabase URL is not configured",
        },
        500,
      );
    }

    if (!supabaseAnonKey) {
      console.error("SUPABASE_ANON_KEY is missing");

      return json(
        {
          success: false,
          error: "Supabase anonymous key is not configured",
        },
        500,
      );
    }

    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is missing");

      return json(
        {
          success: false,
          error: "Supabase service role key is not configured",
        },
        500,
      );
    }

    // --------------------------------------------------
    // 3. Authenticate the currently signed-in user
    // --------------------------------------------------

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      console.error("RESET FUNCTION: Authorization header missing");

      return json(
        {
          success: false,
          error: "Unauthorized",
        },
        401,
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    console.log("RESET FUNCTION: authenticated user", {
      userId: user?.id ?? null,
      error: userError?.message ?? null,
    });

    if (userError || !user) {
      return json(
        {
          success: false,
          error: "Unauthorized",
        },
        401,
      );
    }

    // --------------------------------------------------
    // 4. Verify that the logged-in user is an admin
    // --------------------------------------------------

    const { data: profile, error: profileError } = await userClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    console.log("RESET FUNCTION: profile check", {
      role: profile?.role ?? null,
      error: profileError?.message ?? null,
    });

    if (profileError) {
      console.error("Profile lookup error:", profileError);

      return json(
        {
          success: false,
          error: "Unable to verify administrator permissions",
        },
        500,
      );
    }

    if (profile?.role !== "admin") {
      console.warn("RESET FUNCTION: non-admin attempted password reset", {
        userId: user.id,
      });

      return json(
        {
          success: false,
          error: "Admin access required",
        },
        403,
      );
    }

    // --------------------------------------------------
    // 5. Create privileged Supabase client
    // --------------------------------------------------

    console.log("RESET FUNCTION: creating admin client");

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    // --------------------------------------------------
    // 6. Generate password recovery link
    // --------------------------------------------------

    console.log("RESET FUNCTION: generating recovery link");

    const { data: linkData, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: "recovery",
        email: normalizedEmail,
        options: {
          redirectTo: normalizedRedirectTo,
        },
      });

    console.log("RESET FUNCTION: generateLink result", {
      hasData: Boolean(linkData),
      hasActionLink: Boolean(linkData?.properties?.action_link),
      error: linkError?.message ?? null,
    });

    if (linkError) {
      console.error("Supabase generateLink error:", linkError);

      return json(
        {
          success: false,
          error: linkError.message,
        },
        400,
      );
    }

    const actionLink = linkData?.properties?.action_link;

    if (!actionLink) {
      console.error("Supabase did not return an action link", linkData);

      return json(
        {
          success: false,
          error: "Supabase did not return a password recovery link",
        },
        500,
      );
    }

    // --------------------------------------------------
    // 7. Resend configuration
    // --------------------------------------------------

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("RESEND_FROM_EMAIL");

    console.log("RESET FUNCTION: Resend configuration", {
      hasResendKey: Boolean(resendKey),
      hasFromEmail: Boolean(from),
    });

    if (!resendKey) {
      console.error("RESEND_API_KEY is missing");

      return json(
        {
          success: false,
          error: "Resend API key is not configured",
        },
        500,
      );
    }

    if (!from) {
      console.error("RESEND_FROM_EMAIL is missing");

      return json(
        {
          success: false,
          error: "Resend sender email is not configured",
        },
        500,
      );
    }

    // --------------------------------------------------
    // 8. Build email
    // --------------------------------------------------

    const currentYear = new Date().getFullYear();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >
  <title>Reset your MathsPro password</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f7fb;
    font-family:Arial,Helvetica,sans-serif;
    color:#1f2937;
  "
>

  <div
    style="
      width:100%;
      padding:40px 16px;
      box-sizing:border-box;
    "
  >

    <div
      style="
        max-width:560px;
        margin:0 auto;
        background:#ffffff;
        border:1px solid #e5e7eb;
        border-radius:16px;
        overflow:hidden;
      "
    >

      <!-- Header -->

      <div
        style="
          padding:28px 32px;
          border-bottom:1px solid #eef0f4;
        "
      >

        <div
          style="
            font-size:25px;
            font-weight:700;
            color:#111827;
            letter-spacing:-0.5px;
          "
        >
          MathsPro
        </div>

        <div
          style="
            margin-top:5px;
            font-size:13px;
            color:#6b7280;
          "
        >
          Online Maths Learning Platform
        </div>

      </div>


      <!-- Main Content -->

      <div
        style="
          padding:36px 32px 32px;
        "
      >

        <div
          style="
            display:inline-block;
            padding:7px 11px;
            background:#fff7ed;
            color:#ea580c;
            border-radius:7px;
            font-size:12px;
            font-weight:700;
            margin-bottom:18px;
          "
        >
          PASSWORD RESET
        </div>


        <h1
          style="
            margin:0 0 16px;
            font-size:26px;
            line-height:1.3;
            color:#111827;
          "
        >
          Reset your password
        </h1>


        <p
          style="
            margin:0 0 16px;
            font-size:15px;
            line-height:1.7;
            color:#4b5563;
          "
        >
          We received a request to reset the password
          for your MathsPro account.
        </p>


        <p
          style="
            margin:0 0 28px;
            font-size:15px;
            line-height:1.7;
            color:#4b5563;
          "
        >
          Click the button below to create a new
          password and regain access to your account.
        </p>


        <!-- Reset Button -->

        <div
          style="
            margin:0 0 28px;
          "
        >

          <a
            href="${actionLink}"
            style="
              display:inline-block;
              padding:13px 24px;
              background:#f97316;
              color:#ffffff;
              text-decoration:none;
              font-size:15px;
              font-weight:700;
              border-radius:9px;
            "
          >
            Reset my password
          </a>

        </div>


        <!-- Security Notice -->

        <div
          style="
            padding:16px;
            background:#f9fafb;
            border:1px solid #eef0f4;
            border-radius:10px;
            margin-bottom:24px;
          "
        >

          <p
            style="
              margin:0;
              font-size:13px;
              line-height:1.6;
              color:#6b7280;
            "
          >
            If you did not request a password reset,
            you can safely ignore this email.
            Your password will remain unchanged.
          </p>

        </div>


        <p
          style="
            margin:0;
            font-size:13px;
            line-height:1.6;
            color:#9ca3af;
          "
        >
          For your security, please do not share
          this email or your password-reset link
          with anyone.
        </p>

      </div>


      <!-- Footer -->

      <div
        style="
          padding:22px 32px;
          background:#fafafa;
          border-top:1px solid #eef0f4;
          text-align:center;
        "
      >

        <p
          style="
            margin:0;
            font-size:12px;
            line-height:1.6;
            color:#9ca3af;
          "
        >
          © ${currentYear} MathsPro
        </p>

        <p
          style="
            margin:5px 0 0;
            font-size:12px;
            color:#9ca3af;
          "
        >
          mathspro.academy
        </p>

      </div>

    </div>

  </div>

</body>
</html>
`;

    const text = `
MathsPro
Password Reset

We received a request to reset the password for your MathsPro account.

Reset your password:
${actionLink}

If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

For your security, please do not share this email or your password-reset link with anyone.

© ${currentYear} MathsPro
mathspro.academy
`;

    // --------------------------------------------------
    // 9. Send email through Resend
    // --------------------------------------------------

    console.log("RESET FUNCTION: sending email through Resend");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",

      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        from,
        to: [normalizedEmail],
        subject: "Reset your MathsPro password",
        html,
        text,
      }),
    });

    const resendResponse = await emailResponse.text();

    console.log("RESET FUNCTION: Resend response", {
      status: emailResponse.status,
      ok: emailResponse.ok,
      response: resendResponse,
    });

    if (!emailResponse.ok) {
      console.error("Resend rejected the email:", resendResponse);

      return json(
        {
          success: false,
          error: "Could not send reset email",
        },
        502,
      );
    }

    // --------------------------------------------------
    // 10. Success
    // --------------------------------------------------

    console.log("RESET FUNCTION: password reset email sent successfully");

    return json({
      success: true,
    });
  } catch (error) {
    console.error("RESET FUNCTION ERROR:", error);

    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});
