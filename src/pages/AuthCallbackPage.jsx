import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  const handleAuthCallback = useCallback(async () => {
    try {
      // Exchange the code for a session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (session) {
        // Check if user profile exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", session.user.id)
          .single();

        if (!existingUser) {
          // Create user profile from Google data
          await supabase.from("users").insert({
            auth_id: session.user.id,
            auth_type: "google",
            name:
              session.user.user_metadata.full_name ||
              session.user.email.split("@")[0],
            email: session.user.email,
            profile_pic_url: session.user.user_metadata.avatar_url,
          });
        }

        // Redirect to share page
        navigate("/share");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Auth callback error:", error);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    handleAuthCallback();
  }, [handleAuthCallback]);

  return (
    <div className="auth-callback">
      <p>Completing sign in...</p>
    </div>
  );
}
