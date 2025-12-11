import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  userId: string;
  userName: string;
  emailId: string;
  contactNumber: string;
  location: string;
  grade: number;
  userSports: { sportId: number }[];
}

interface UserDetails {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface UserContextType {
  userDetails: UserDetails | null;
  setUserDetails: React.Dispatch<React.SetStateAction<UserDetails | null>>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  // Load from localStorage on first load
  useEffect(() => {
    const loadUserDetails = () => {
      try {
        const stored = localStorage.getItem("userDetails");
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate the parsed data
          if (
            parsed &&
            typeof parsed === "object" &&
            parsed.user &&
            typeof parsed.user === "object" &&
            parsed.user.userId &&
            parsed.accessToken &&
            parsed.refreshToken
          ) {
            setUserDetails(parsed);
            console.log("Loaded userDetails from localStorage:", parsed);
          } else {
            console.warn("Invalid userDetails in localStorage, clearing it.");
            localStorage.removeItem("userDetails");
          }
        }
      } catch (error) {
        console.error("Error parsing userDetails from localStorage:", error);
        localStorage.removeItem("userDetails");
      }
    };
    loadUserDetails();
  }, []);

  // Save to localStorage when userDetails changes
  useEffect(() => {
    try {
      if (userDetails) {
        localStorage.setItem("userDetails", JSON.stringify(userDetails));
        console.log("Saved userDetails to localStorage:", userDetails);
      } else {
        localStorage.removeItem("userDetails");
        console.log("Cleared userDetails from localStorage");
      }
    } catch (error) {
      console.error("Error saving userDetails to localStorage:", error);
    }
  }, [userDetails]);

  // Logout function to clear user details
  const logout = () => {
    setUserDetails(null);
    localStorage.removeItem("userDetails");
    console.log("User logged out, userDetails cleared");
  };

  return (
    <UserContext.Provider value={{ userDetails, setUserDetails, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
