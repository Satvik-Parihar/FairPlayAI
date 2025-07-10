// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
// import axios from "axios";

// const RegisterPage = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     // Basic validations
//     if (!name || !email || !password || !confirmPassword) {
//       toast({
//         title: "Missing Information",
//         description: "Please fill in all fields.",
//         variant: "destructive",
//       });
//       setIsLoading(false);
//       return;
//     }

//     if (password !== confirmPassword) {
//       toast({
//         title: "Password Mismatch",
//         description: "Passwords do not match.",
//         variant: "destructive",
//       });
//       setIsLoading(false);
//       return;
//     }

//     // try {
//     //   // Simulate backend call
//     //   await new Promise((res) => setTimeout(res, 1500));

//     //   toast({
//     //     title: "Account Created",
//     //     description: "You can now sign in to your account.",
//     //   });

//     //   // Redirect to login
//     //   navigate("/login");
//     // } catch (error) {
//     //   toast({
//     //     title: "Registration Failed",
//     //     description: "Something went wrong. Please try again.",
//     //     variant: "destructive",
//     //   });
//     // } 
//     try {
//   const response = await axios.post("http://127.0.0.1:8000/api/auth/register/", {
//     name,
//     email,
//     password,
//   });

//   toast({
//     title: "Account Created",
//     description: "You can now sign in to your account.",
//   });

//   navigate("/login");
// } catch (error) {
//   console.error("Registration error:", error.response?.data || error.message);
//   toast({
//     title: "Registration Failed",
//     description: error.response?.data?.error || "Something went wrong. Please try again.",
//     variant: "destructive",
//   });
// }

//     finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
//       <div className="absolute inset-0 opacity-20">
//         <div
//           className="absolute inset-0"
//           style={{
//             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//           }}
//         ></div>
//       </div>

//       <div className="w-full max-w-md mx-auto relative z-10">
//         <div className="text-center mb-8">
//           <Link to="/" className="inline-flex items-center space-x-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
//               <span className="text-white font-bold text-xl">F</span>
//             </div>
//             <span className="text-2xl font-bold text-white">FairPlayAI</span>
//           </Link>
//         </div>

//         <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md">
//           <CardHeader className="text-center pb-6">
//             <CardTitle className="text-2xl font-bold text-gray-900">Create an Account</CardTitle>
//             <CardDescription className="text-gray-600">
//               Join the fairness revolution — it’s free!
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <form onSubmit={handleRegister} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
//                 <Input
//                   id="name"
//                   type="text"
//                   placeholder="Your full name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="h-12"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="Enter your email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="pl-10 h-12"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Create a password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="pl-10 pr-10 h-12"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="confirm" className="text-gray-700 font-medium">Confirm Password</Label>
//                 <Input
//                   id="confirm"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Re-enter your password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="h-12"
//                   required
//                 />
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Creating Account...
//                   </>
//                 ) : (
//                   <>
//                     <UserPlus className="mr-2 h-4 w-4" />
//                     Sign Up
//                   </>
//                 )}
//               </Button>
//             </form>

//             <div className="text-center text-sm text-gray-600">
//               Already have an account?{" "}
//               <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
//                 Sign in
//               </Link>
//             </div>
//           </CardContent>
//         </Card>

//         <div className="text-center mt-6">
//           <p className="text-xs text-gray-400">
//             By signing up, you agree to our{" "}
//             <Link to="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</Link>{" "}
//             and{" "}
//             <Link to="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import axios from "axios";
import { setUser } from "@/lib/auth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validations
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/register/", {
        name,
        email,
        password,
      });
      toast({
        title: "Account Created",
        description: "You are now signed in!",
      });
      // Auto-login after registration
      try {
        const loginResponse = await axios.post("http://127.0.0.1:8000/api/auth/login/", {
          email,
          password,
        });
        setUser(loginResponse.data.user);
        navigate("/dashboard");
      } catch (loginError) {
        toast({
          title: "Login Failed",
          description: loginError.response?.data?.message || "Could not log in after registration.",
          variant: "destructive",
        });
        navigate("/login");
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data?.error || "Something went wrong. Please try again.";
      toast({
        title: "Registration Failed",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-2xl font-bold text-white">FairPlayAI</span>
          </Link>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Create an Account</CardTitle>
            <CardDescription className="text-gray-600">
              Join the fairness revolution — it’s free!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-gray-700 font-medium">Confirm Password</Label>
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
