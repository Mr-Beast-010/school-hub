import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const STUDENT_PASSWORD = "Student123";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // Verify the caller is an authenticated admin
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional: single email passed in body, else process all students
    let targetEmails: string[] | null = null;
    try {
      const body = await req.json();
      if (body?.email) targetEmails = [String(body.email).toLowerCase()];
    } catch (_) {
      // no body -> process all
    }

    let query = admin.from("students").select("email, name").not("email", "is", null);
    if (targetEmails) query = query.in("email", targetEmails);
    const { data: students, error: stuErr } = await query;
    if (stuErr) throw stuErr;

    // Existing auth users (paginated)
    const existing = new Set<string>();
    let page = 1;
    while (true) {
      const { data: list, error } = await admin.auth.admin.listUsers({
        page,
        perPage: 1000,
      });
      if (error) throw error;
      list.users.forEach((u) => u.email && existing.add(u.email.toLowerCase()));
      if (list.users.length < 1000) break;
      page++;
    }

    const seen = new Set<string>();
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const s of students ?? []) {
      const email = (s.email as string).toLowerCase().trim();
      if (!email || seen.has(email)) continue;
      seen.add(email);
      if (existing.has(email)) {
        skipped++;
        continue;
      }
      const { error } = await admin.auth.admin.createUser({
        email,
        password: STUDENT_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: s.name, role: "student" },
      });
      if (error) {
        errors.push(`${email}: ${error.message}`);
      } else {
        created++;
        existing.add(email);
      }
    }

    return new Response(
      JSON.stringify({ created, skipped, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
