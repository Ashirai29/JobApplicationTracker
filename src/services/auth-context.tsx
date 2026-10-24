import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    type User,
    type UserCredential,
} from "firebase/auth";
import { firebaseAuth } from "@/firebase";

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signin: (email: string, password: string) => Promise<UserCredential>;
    signup: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        return onAuthStateChanged(firebaseAuth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
    }, []);

return (
    <AuthContext.Provider value={{ currentUser, loading, signin:(email, password) => signInWithEmailAndPassword(firebaseAuth,email,password), signup:(email, password) => createUserWithEmailAndPassword(firebaseAuth,email,password), logout: () => signOut(firebaseAuth) }}>
        {children}
    </AuthContext.Provider>
);
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider.");
    }
    return context;
}