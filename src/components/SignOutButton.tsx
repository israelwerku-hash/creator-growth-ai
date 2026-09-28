"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  
  const handleSignOut = async () => {
    // Clear client-side session first
    const supabase = createClient();
    await supabase.auth.signOut();
    // Then clear server-side session
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="btn-ghost text-xs"
    >
      Sign out
    </button>
  );
}
