import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import type { ChangeEvent, FormEvent } from "react";
import type { User } from "../types";
import { getApiErrorMessage } from "../api/axios";
import { AuthShell } from "../components/AuthShell";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { InlineAlert } from "../components/PageLayout";

const Login = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, user]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post<User>("/auth/login", formData);

      setUser(data);
      navigate(location.state?.from?.pathname || "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return <AuthShell title="Login" subtitle="Access your BizFlow workspace." footer={<>No account? <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Create one</Link></>}>
    {error && <div className="mb-4"><InlineAlert>{error}</InlineAlert></div>}
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Email" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
      <Input label="Password" id="password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Your password" />
      <Button type="submit" fullWidth loading={loading}>Login</Button>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">Forgot your password? <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Reset it</Link></p>
    </form>
  </AuthShell>;
};

export default Login;
