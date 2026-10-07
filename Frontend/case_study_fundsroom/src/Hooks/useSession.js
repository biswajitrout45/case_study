import { useEffect, useState } from "react";
import { apiRequest } from "../Services/api";

export default function useSession() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(Boolean(localStorage.getItem("token")));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    let active = true;
    apiRequest("/auth/me")
      .then((result) => { if (active) setUser(result.user); })
      .catch(() => localStorage.removeItem("token"))
      .finally(() => { if (active) setCheckingSession(false); });
    return () => { active = false; };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return { user, setUser, checkingSession, logout };
}
