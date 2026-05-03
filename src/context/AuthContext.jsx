import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // adjust path

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch profile (role)
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setRole(data.role);
    }
  };

  // 🔄 Check session on load
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }

      setLoading(false);
    };

    init();

    // 🔁 Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setRole(null);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 🔐 Login
  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { success: false, error: error.message };

    return { success: true };
  };

  // 🆕 Signup (with role)
  const signup = async ({ email, password, name, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { success: false, error: error.message };

    const user = data.user;

    // 🔥 Insert profile
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: user.id,
        name,
        role,
      },
    ]);

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    return { success: true };
  };

  // 🚪 Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
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
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
