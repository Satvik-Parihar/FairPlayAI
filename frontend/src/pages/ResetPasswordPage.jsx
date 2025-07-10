import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ResetPasswordPage = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const validatePassword = (pwd) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(pwd);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return;
        }

        if (!validatePassword(password)) {
            toast({
                title: "Weak Password",
                description:
                    "Password must be at least 8 characters long and include 1 uppercase, 1 lowercase letter, and 1 number.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            await axios.post("http://127.0.0.1:8000/api/accounts/password-reset-confirm/", {
                uid,
                token,
                email,
                new_password: password,
                confirm_password: confirmPassword,
            });
            toast({ title: "Password reset successful" });
            navigate("/login");
        } catch (error) {
            const data = error.response?.data || {};
            toast({
                title: "Reset Failed",
                description: Object.values(data).join(" ") || "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white/95 p-8 rounded-xl shadow-2xl backdrop-blur-md space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-800">
                    Reset Password
                </h2>
                <p className="text-sm text-gray-600 text-center">
                    Enter your email and a new password to continue.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-12 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all"
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
