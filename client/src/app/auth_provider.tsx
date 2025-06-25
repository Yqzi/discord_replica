"use client"; // required for useEffect and auth

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";

interface AuthContextType {
    user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                try {
                    const res = await signInAnonymously(auth);
                    setUser(res.user);
                } catch (err) {
                    console.error("Anon sign-in failed", err);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
    );
};
