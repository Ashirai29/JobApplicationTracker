import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { firebaseAuth } from "@/firebase.web";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

interface AuthContextType {
    currentUser: User | undefined;
    loading: boolean;
    signin: (email: string, password: string) => Promise<unknown>;
    signup: (email: string, password: string) => Promise<unknown>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | undefined>();
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        return onAuthStateChanged(firebaseAuth, (user) => {
            setCurrentUser(user || undefined);
            setLoading(false);
    })
});

return (
    <AuthContext.Provider value={{ currentUser, loading, signin:(email, password) => signInWithEmailAndPassword(firebaseAuth,email,password), signup:(email, password) => createUserWithEmailAndPassword(firebaseAuth,email,password), logout: () => signOut(firebaseAuth) }}>
        {children}
    </AuthContext.Provider>
);
}