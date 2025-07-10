
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
