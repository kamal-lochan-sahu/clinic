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

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone required"),
  password: z.string().min(6, "Minimum 6 characters"),
  clinicName: z.string().min(2, "Clinic name required"),
  specialization: z.string().optional(),
});

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", data);
      login(res.data.data.user, res.data.data.accessToken);
      toast.success("Registration successful! Welcome to MediManage!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-xl">MediManage</h1>
            <p className="text-xs text-gray-400">Register your clinic</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Doctor / Owner Name" placeholder="Dr. Ramesh Kumar" error={errors.name?.message} {...register("name")} />
          <Input label="Clinic Name" placeholder="City Health Clinic" error={errors.clinicName?.message} {...register("clinicName")} />
          <Input label="Specialization" placeholder="General Physician" {...register("specialization")} />
          <Input label="Email" type="email" placeholder="doctor@clinic.com" error={errors.email?.message} {...register("email")} />
          <Input label="Phone" placeholder="+91 9876543210" error={errors.phone?.message} {...register("phone")} />
          <Input label="Password" type="password" placeholder="Create password" error={errors.password?.message} {...register("password")} />
          <Button type="submit" loading={loading} className="w-full justify-center">Create Account</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
