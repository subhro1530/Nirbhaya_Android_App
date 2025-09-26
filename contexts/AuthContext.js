import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);
const TOKEN_KEY = "@auth_token";
const USER_KEY = "@auth_user";
export const API_BASE = "https://nirbhayabackend.onrender.com";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem(TOKEN_KEY);
        const u = await AsyncStorage.getItem(USER_KEY);
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const setAuthState = async (t, u) => {
    setToken(t);
    setUser(u);
    try {
      await AsyncStorage.setItem(TOKEN_KEY, t);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch {}
  };

  const signOut = useCallback(async () => {
    setToken(null);
    setUser(null);
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, user, setAuthState, signOut, loading, API_BASE }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

