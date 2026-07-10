import { createContext, useEffect, useState } from "react";
import { getOwnerProfile, loginOwner, loginMember } from "../api/authApi";
import { getMemberProfile } from "../api/memberApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("access_token");
    const storedRole = localStorage.getItem("role");

    if (!token || !storedRole) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      let response;
      if (storedRole === "owner") {
        response = await getOwnerProfile();
      } else {
        response = await getMemberProfile();
      }

      const userData = response.data.data;
      setUser(userData);
      setRole(storedRole);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Authentication Error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (credentials, isMember = false) => {
    let response;
    if (isMember) {
      response = await loginMember(credentials);
    } else {
      response = await loginOwner(credentials);
    }

    const { access_token, role: userRole } = response.data.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("role", userRole || (isMember ? "member" : "owner"));
    await loadUser();
    return response;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        owner: role === "owner" ? user : null,
        member: role === "member" ? user : null,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}