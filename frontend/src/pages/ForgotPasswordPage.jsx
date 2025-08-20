
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/accounts/password-reset-request/", {
                email,
            });

            toast({
                title: "Email Sent",
                description: res.data.message || "Check your inbox for a password reset link.",
            });

            setEmail("");
        } catch (error) {
            const errMsg =
                error.response?.data?.email?.[0] ||
                error.response?.data?.error ||
                "Something went wrong. Try again.";

            const isNotFound = errMsg.toLowerCase().includes("no account");

            toast({
                title: isNotFound ? "Email Not Found" : "Error",
                description: errMsg,
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
                    Forgot Password
                </h2>
                <p className="text-sm text-gray-600 text-center">
                    Enter your email and we'll send you a reset link.
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
                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;