import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mdkqdlswjnlsnclqwgss.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_1EgKd7T-YHOu827UP9OiFQ_8kCjLyR2";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
