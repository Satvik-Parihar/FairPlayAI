
import ThemeToggle from "./ThemeToggle";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Upload, FileText, LogIn, LayoutDashboard, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { getUser, clearUser } from "@/lib/auth";

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = getUser();
  
  const isActive = (path) => location.pathname === path;
  
  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Upload", href: "/upload", icon: Upload },
    
  ];
  
  const handleLogout = () => {
    clearUser();
    window.location.href = "/";
  };
  
  return (
    // <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
    <nav className="bg-white/95 dark:bg-gray-900 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  FairPlayAI
                </span>
                <span className="text-xs text-gray-500 -mt-1">Bias Checker</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(item.href) 
                      ? "text-blue-600 bg-blue-50 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.name}</span>
                  {item.name === "Upload" && (
                    <Badge className="ml-1 bg-green-100 text-green-600 text-xs">New</Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* <ThemeToggle /> */}
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="flex items-center text-gray-700 font-medium">
                  <User size={16} className="mr-1" />
                  {user.name || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <LogIn size={16} className="mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
            <Link to="/upload">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 bg-white/95 backdrop-blur-md">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                  {item.name === "Upload" && (
                    <Badge className="ml-auto bg-green-100 text-green-600 text-xs">New</Badge>
                  )}
                </Link>
              ))}
              
              <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                {user ? (
                  <div className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700">
                    <User size={18} />
                    <span>{user.name || user.email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </Link>
                )}
                <Link
                  to="/upload"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
