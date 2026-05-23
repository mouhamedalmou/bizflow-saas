import { useContext } from "react";
import { AuthContext } from "../context/authContextCore";

export const useAuth = () => useContext(AuthContext);
