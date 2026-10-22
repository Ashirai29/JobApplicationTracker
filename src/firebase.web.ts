import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./environment";
import {browserLocalPersistence, initializeAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = initializeAuth(firebaseApp, {
    persistence: browserLocalPersistence
}) ;

export const firestore = getFirestore(firebaseApp);