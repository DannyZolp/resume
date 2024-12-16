import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AuthState {
  loggedIn: boolean;
  userId: string;
  login: (userId: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        loggedIn: false,
        userId: "",
        login: (userId: string) => set({ loggedIn: true, userId }),
        logout: () => set({ loggedIn: false })
      }),
      {
        name: "auth"
      }
    )
  )
);
