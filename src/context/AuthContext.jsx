/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(undefined);

const getErrorMessage = (error, fallback) => error?.message || fallback;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const profileRequestRef = useRef(0);
  const sessionSyncRef = useRef(0);
  const activeUserIdRef = useRef(null);

  const clearAuthState = () => {
    profileRequestRef.current += 1;
    sessionSyncRef.current += 1;
    activeUserIdRef.current = null;
    setUser(null);
    setRole(null);
  };

  const loadProfile = async (userId) => {
    const requestId = ++profileRequestRef.current;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, role")
      .eq("id", userId)
      .maybeSingle();

    // Ignore an older request after a sign-out or account change.
    if (!mountedRef.current || requestId !== profileRequestRef.current) {
      return null;
    }

    if (error) {
      console.error("Unable to load the user profile:", error);
      setRole(null);
      return null;
    }

    setRole(data?.role ?? null);
    return data;
  };

  useEffect(() => {
    mountedRef.current = true;
    let isActive = true;

    const syncSession = (session, { refreshProfile = true } = {}) => {
      if (!session?.user) {
        clearAuthState();
        if (mountedRef.current) setLoading(false);
        return;
      }

      const isDifferentUser = activeUserIdRef.current !== session.user.id;
      activeUserIdRef.current = session.user.id;
      const syncId = ++sessionSyncRef.current;
      setUser(session.user);

      // TOKEN_REFRESHED is emitted when returning to a background tab. The
      // previous code cleared the role before its profile request completed,
      // so protected routes treated a valid session as unauthorized and
      // redirected the user. A refresh keeps the already verified role.
      if (!isDifferentUser && !refreshProfile) {
        if (mountedRef.current) setLoading(false);
        return;
      }

      setRole(null);
      setLoading(true);

      // Do not await queries inside Supabase's auth-state callback. It can hold
      // the auth client's lock and leave later auth calls waiting indefinitely.
      void loadProfile(session.user.id).finally(() => {
        // getSession and INITIAL_SESSION can both run during a reload. Only the
        // most recent sync may finish the loading state.
        if (
          mountedRef.current &&
          isActive &&
          syncId === sessionSyncRef.current
        ) {
          setLoading(false);
        }
      });
    };

    const initialize = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        if (!isActive) return;
        console.error("Unable to restore the session:", error);
        clearAuthState();
        if (mountedRef.current) setLoading(false);
        return;
      }

      if (isActive) syncSession(session);
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) return;

      syncSession(session, {
        // Refreshing an access token must never temporarily revoke the role
        // that the current protected route relies on.
        refreshProfile: event !== "TOKEN_REFRESHED",
      });
    });

    return () => {
      isActive = false;
      mountedRef.current = false;
      profileRequestRef.current += 1;
      sessionSyncRef.current += 1;
      subscription.unsubscribe();
    };
  }, []);

  const login = async ({ email, password, expectedRole = null }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return { success: false, error: getErrorMessage(error, "Login failed") };
    }

    setUser(data.user);
    setRole(null);
    const profile = await loadProfile(data.user.id);

    if (!profile) {
      await supabase.auth.signOut();
      return { success: false, error: "Profile not found" };
    }

    const allowed =
      !expectedRole ||
      (expectedRole === "tutor" &&
        (profile.role === "tutor" || profile.role === "admin")) ||
      (expectedRole === "student" && profile.role === "student") ||
      (expectedRole === "admin" && profile.role === "admin");

    if (!allowed) {
      await supabase.auth.signOut();
      return { success: false, error: "Unauthorized access" };
    }

    // An admin using the tutor portal gets the tutor-facing landing page.
    const finalRole =
      expectedRole === "tutor" && profile.role === "admin"
        ? "tutor"
        : profile.role;

    setRole(finalRole);
    return { success: true, role: finalRole };
  };

  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    return error
      ? { success: false, error: error.message }
      : { success: true };
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    return error
      ? { success: false, error: error.message }
      : { success: true };
  };

  const signup = async ({ email, password, name, role: signupRole }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return { success: false, error: error.message };
    }

    // With email confirmation enabled Supabase may not return a session, but it
    // still returns the created user. Avoid creating an invalid profile row.
    if (!data.user) {
      return {
        success: false,
        error: "Account creation did not return a user. Please try again.",
      };
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      name,
      role: signupRole,
    });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    return { success: true };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    clearAuthState();
    return { success: true };
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
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
