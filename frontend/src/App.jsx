
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/layout/AppLayout";
import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import ReportPage from "./pages/ReportPage";
import LoginPage from "./pages/LoginPage";

import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
// import CleaningDashboard from "./pages/CleaningDashboard"; // Import the new component
// import { Toaster } from "@/components/ui/toaster"; 

// ✅ Sync user from Google/GitHub OAuth redirect
import OAuthUserSync from "@/components/OAuthUserSync";

const queryClient = new QueryClient({ // brain for react query
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
      <OAuthUserSync />
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="report/:reportId?" element={<ReportPage />} />
            {/* <Route path="/clean-data/:report_id" element={<CleaningDashboard />} /> New route */}
        {/* Add a new route for attribute selection after cleaning */}
        <Route path="/select-attributes/:report_id" element={<div>Attribute Selection Page (Coming Soon)</div>} /> 
            
            <Route path="*" element={<NotFound />} />
          </Route>
          {/* Auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
          {/* <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} /> */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
