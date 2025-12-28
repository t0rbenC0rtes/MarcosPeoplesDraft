import { createContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(async (authId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  }, []);

  const checkAnonymousSession = useCallback(() => {
    const anonymousSession = localStorage.getItem("anonymous_session");
    if (anonymousSession) {
      try {
        const session = JSON.parse(anonymousSession);
        if (session.expiresAt > Date.now()) {
          setUser(session);
        } else {
          localStorage.removeItem("anonymous_session");
        }
      } catch (error) {
        console.error("Error parsing anonymous session:", error);
        localStorage.removeItem("anonymous_session");
      }
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        checkAnonymousSession();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile, checkAnonymousSession]);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signInAnonymously = async (name) => {
    try {
      // Create anonymous user in database
      const anonymousId = crypto.randomUUID();

      const { data, error } = await supabase
        .from("users")
        .insert({
          auth_id: anonymousId,
          auth_type: "anonymous",
          name: name || "Anonymous",
        })
        .select()
        .single();

      if (error) throw error;

      // Store in localStorage (30 days)
      const anonymousSession = {
        ...data,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      localStorage.setItem(
        "anonymous_session",
        JSON.stringify(anonymousSession)
      );
      setUser(data);

      return data;
    } catch (error) {
      console.error("Error signing in anonymously:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (session) {
        // Google OAuth sign out
        await supabase.auth.signOut();
      } else {
        // Anonymous sign out
        localStorage.removeItem("anonymous_session");
      }
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInAnonymously,
    signOut,
    isAuthenticated: !!user,
    isAnonymous: user?.auth_type === "anonymous",
    isGoogleUser: user?.auth_type === "google",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
