import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    email,
    role,
    firstName,
    lastName,
    curriculum,
    level,
    parentPhone,
    parentEmail,
    phone,
  } = req.body;

  // 🔐 Create auth user (no password → invite email)
  const { data, error } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email);

  if (error) return res.status(400).json({ error });

  const userId = data.user.id;

  // 🧠 Insert into profiles
  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: userId,
    role,
    first_name: firstName,
    last_name: lastName,
    email,

    curriculum: role === "student" ? curriculum : null,
    level: role === "student" ? level : null,
    parent_phone: role === "student" ? parentPhone : null,
    parent_email: role === "student" ? parentEmail : null,

    phone: role === "tutor" ? phone : null,
  });

  if (profileError) return res.status(400).json({ error: profileError });

  res.status(200).json({ success: true });
}
