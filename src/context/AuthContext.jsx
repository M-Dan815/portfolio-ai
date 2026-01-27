import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({children}) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchUser = useCallback(async () => {
		try {
			if (api.getToken()) {
				const userData = await api.getMe();
				setUser(userData);
			}
		} catch (err) {
			console.error("Failed to fetch user:", err);
			api.removeToken();
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	const login = async (email, password) => {
		setError(null);
		try {
			await api.login(email, password);
			await fetchUser();
			return {success: true};
		} catch (err) {
			setError(err.message);
			return {success: false, error: err.message};
		}
	};

	const signup = async (email, password, fullName) => {
		setError(null);
		try {
			await api.signup(email, password, fullName);
			// Auto login after signup
			await api.login(email, password);
			await fetchUser();
			return {success: true};
		} catch (err) {
			setError(err.message);
			return {success: false, error: err.message};
		}
	};

	const logout = () => {
		api.logout();
		setUser(null);
	};

	const updateProfile = async (data) => {
		try {
			const updatedUser = await api.updateMe(data);
			setUser(updatedUser);
			return {success: true};
		} catch (err) {
			return {success: false, error: err.message};
		}
	};

	const value = {
		user,
		loading,
		error,
		isAuthenticated: !!user,
		login,
		signup,
		logout,
		updateProfile,
		clearError: () => setError(null),
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

export default AuthContext;
