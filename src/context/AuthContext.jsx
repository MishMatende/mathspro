/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(undefined);

const getErrorMessage = (error, fallback) => error?.message || fallback;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const mountedRef = useRef(true);
  const profileRequestRef = useRef(0);
  const sessionSyncRef = useRef(0);
  const activeUserIdRef = useRef(null);
  const profileLoadRef = useRef(null);

  const clearAuthState = () => {
    profileRequestRef.current += 1;
    sessionSyncRef.current += 1;
    activeUserIdRef.current = null;
    profileLoadRef.current = null;
    setUser(null);
    setRole(null);
    setProfileError(null);
  };

  const loadProfile = (userId) => {
    if (profileLoadRef.current?.userId === userId) {
      return profileLoadRef.current.promise;
    }
    const requestId = ++profileRequestRef.current;
    setProfileError(null);
    const promise = Promise.resolve().then(async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, role")
          .eq("id", userId)
          .maybeSingle();

        // Ignore an older request after a sign-out or account change.
        if (!mountedRef.current || requestId !== profileRequestRef.current) return null;
        if (error) throw error;
        if (!data?.role) throw new Error("Account profile unavailable");

        setRole(data.role);
        return data;
      } catch (error) {
        if (!mountedRef.current || requestId !== profileRequestRef.current) return null;
        console.error("Unable to load the user profile:", error);
        setRole(null);
        setProfileError("Unable to load your account profile. Please try again.");
        return null;
      }
    });
    profileLoadRef.current = { userId, promise };
    return promise;
  };

  useEffect(() => {
    mountedRef.current = true;
    let isActive = true;

    const syncSession = (session) => {
      if (!session?.user) {
        clearAuthState();
        if (mountedRef.current) setLoading(false);
        return;
      }

      const isDifferentUser = activeUserIdRef.current !== session.user.id;
      activeUserIdRef.current = session.user.id;
      setUser(session.user);

      // SIGNED_IN also fires when returning to a tab or file picker. Same-user
      // events must preserve mounted pages and any pending initial profile load.
      if (!isDifferentUser) return;

      const syncId = ++sessionSyncRef.current;
      setRole(null);
      setLoading(true);

      // Do not await queries inside Supabase's auth-state callback. It can hold
      // the auth client's lock and leave later auth calls waiting indefinitely.
      void loadProfile(session.user.id).finally(() => {
        // Only the current account's request may finish the loading state.
        if (
          mountedRef.current &&
          isActive &&
          syncId === sessionSyncRef.current
        ) {
          setLoading(false);
        }
      });
    };

    // INITIAL_SESSION restores auth. A parallel getSession could apply an old
    // snapshot after a newer sign-in or sign-out event.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) return;

      syncSession(session);
    });

    return () => {
      isActive = false;
      mountedRef.current = false;
      profileRequestRef.current += 1;
      sessionSyncRef.current += 1;
      activeUserIdRef.current = null;
      profileLoadRef.current = null;
      subscription.unsubscribe();
    };
  }, []);

  const retryProfile = async () => {
    const userId = activeUserIdRef.current;
    if (!userId) return;
    const syncId = ++sessionSyncRef.current;
    profileLoadRef.current = null;
    setLoading(true);
    await loadProfile(userId);
    if (mountedRef.current && syncId === sessionSyncRef.current) setLoading(false);
  };

  const login = async ({ email, password, expectedRole = null }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return { success: false, error: getErrorMessage(error, "Login failed") };
    }

    setUser(data.user);
    const profile = await loadProfile(data.user.id);

    if (!mountedRef.current || activeUserIdRef.current !== data.user.id) {
      return { success: false, error: "The session changed. Please sign in again." };
    }

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

    // Keep the actual role for route authorization; finalRole selects the portal.
    setRole(profile.role);
    return { success: true, role: finalRole };
  };

  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    return error
      ? { success: false, error: error.message }
      : { success: true };
  };

  const requestPasswordResetOtp = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    return error
      ? { success: false, error: error.message }
      : { success: true };
  };

  const sendAdminPasswordResetLink = async (email) => {
    const { data, error } = await supabase.functions.invoke(
      "admin-send-password-reset-link",
      { body: { email, redirectTo: `${window.location.origin}/update-password` } },
    );

    return error || !data?.success
      ? {
          success: false,
          error: getErrorMessage(error, data?.error || "Failed to send reset link"),
        }
      : { success: true };
  };

  const verifyPasswordResetOtp = async ({ email, token }) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "recovery",
    });

    return error || !data.session
      ? {
          success: false,
          error: getErrorMessage(error, "That verification code is invalid or has expired"),
        }
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
        profileError,
        retryProfile,
        login,
        signup,
        logout,
        updatePassword,
        requestPasswordResetOtp,
        sendAdminPasswordResetLink,
        verifyPasswordResetOtp,
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
