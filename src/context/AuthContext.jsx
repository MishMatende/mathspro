import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [role, setRole] = useState(null);

  const [loading, setLoading] = useState(true);

  // 🔥 Fetch profile with cache
  const fetchProfile = async (userId, forceRefresh = false) => {
    // 🔥 Check cache first
    if (!forceRefresh) {
      const cachedProfile = sessionStorage.getItem("auth_profile");

      if (cachedProfile) {
        const parsed = JSON.parse(cachedProfile);

        setRole(parsed.role);

        return parsed;
      }
    }

    // 🔥 Fetch from DB
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setRole(data.role);

      // 🔥 Cache profile
      sessionStorage.setItem("auth_profile", JSON.stringify(data));

      return data;
    }

    return null;
  };

  // 🔄 Check session on load
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        await fetchProfile(session.user.id);
      }

      setLoading(false);
    };

    init();

    // 🔁 Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUser(session.user);

        await fetchProfile(session.user.id);
      } else {
        setUser(null);

        setRole(null);

        // 🔥 Clear cache on logout
        sessionStorage.removeItem("auth_profile");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔐 Login
  const login = async ({ email, password, expectedRole = null }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    const user = data.user;

    // 🔥 Fetch fresh profile
    const profile = await fetchProfile(user.id, true);

    if (!profile) {
      await supabase.auth.signOut();

      return {
        success: false,
        error: "Profile not found",
      };
    }

    // 🔥 Role protection
    if (expectedRole) {
      const allowed =
        // Tutor portal
        (expectedRole === "tutor" &&
          (profile.role === "tutor" || profile.role === "admin")) ||
        // Student portal
        (expectedRole === "student" && profile.role === "student") ||
        // Admin portal
        (expectedRole === "admin" && profile.role === "admin");

      if (!allowed) {
        await supabase.auth.signOut();

        return {
          success: false,
          error: "Unauthorized access",
        };
      }
    }

    // 🔥 Admin logging through tutor portal behaves as tutor
    let finalRole = profile.role;

    if (expectedRole === "tutor" && profile.role === "admin") {
      finalRole = "tutor";
    }

    setUser(user);

    setRole(finalRole);

    return {
      success: true,
      role: finalRole,
    };
  };

  // 🔑 Update Password
  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  };

  // 🔑 Send password reset email
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  };

  // 🆕 Signup
  const signup = async ({ email, password, name, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    const user = data.user;

    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: user.id,
        name,
        role,
      },
    ]);

    if (profileError) {
      return {
        success: false,
        error: profileError.message,
      };
    }

    return {
      success: true,
    };
  };

  // 🚪 Logout
  const logout = async () => {
    await supabase.auth.signOut();

    setUser(null);

    setRole(null);

    // 🔥 Clear cache
    sessionStorage.removeItem("auth_profile");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        signup,
        logout,
        updatePassword,
        resetPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
