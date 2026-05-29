import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { Activity } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import api from "../../services/api";
import toast from "react-hot-toast";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useState } from "react";

const schema = z.object({ email: z.string().email("Invalid email"), password: z.string().min(6, "Minimum 6 characters") });

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      login(res.data.data.user, res.data.data.accessToken);
      toast.success("Welcome back, " + res.data.data.user.name + "!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-xl">MediManage</h1>
            <p className="text-xs text-gray-400">Clinic Management System</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
        <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" placeholder="doctor@clinic.com" error={errors.email?.message} {...register("email")} />
          <Input label="Password" type="password" placeholder="Enter password" error={errors.password?.message} {...register("password")} />
          <Button type="submit" loading={loading} className="w-full justify-center">Sign In</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          New clinic? <Link to="/register" className="text-primary-600 font-medium hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
