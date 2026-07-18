import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import type { ChangeEvent, FormEvent } from "react";
import type { ApiMessage } from "../types";
import { getApiErrorMessage } from "../api/axios";
import { AuthShell } from "../components/AuthShell";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { InlineAlert } from "../components/PageLayout";

const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await api.post<ApiMessage>("/auth/register", formData);

      setSuccess(data.message || "Account created. Please verify your email.");
      setFormData({
        name: "",
        email: "",
        password: "",
      });
    } catch (err) {
      const message = getApiErrorMessage(err, "Registration failed");

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return <AuthShell title="Create account" subtitle="Start using BizFlow with a customer account." footer={<>Already registered? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Login</Link></>}>
    {error && <div className="mb-4"><InlineAlert>{error}</InlineAlert></div>}
    {success && <div className="mb-4"><InlineAlert tone="success">{success}</InlineAlert></div>}
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" />
      <Input label="Email" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
      <Input label="Password" id="password" name="password" type="password" minLength={6} value={formData.password} onChange={handleChange} required placeholder="Minimum 6 characters" />
      <Button type="submit" fullWidth loading={loading}>Create account</Button>
    </form>
  </AuthShell>;
};

export default Register;
