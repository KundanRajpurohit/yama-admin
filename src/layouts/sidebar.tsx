import { useState } from "react";
import {
  FiFilm,
  FiHome,
  FiLogOut,
  FiMenu,
  FiUpload,
  FiVideo,
} from "react-icons/fi";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";

const SidebarLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserDetails } = useUser();

  const handleLogout = () => {
    localStorage.removeItem("userDetails");
    setUserDetails(null);
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", to: "/dashboard", icon: <FiHome /> },
    { name: "Raw Videos", to: "/raw-videos", icon: <FiVideo /> },
    { name: "Ready Videos", to: "/ready-videos", icon: <FiFilm /> },
    { name: "Upload Video", to: "/upload", icon: <FiUpload /> },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-gray-900 text-white transition-all duration-300 p-4 flex flex-col`}
      >
        <button
          className="mb-6 text-white text-xl focus:outline-none"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <FiMenu />
        </button>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.to}
              className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition ${
                location.pathname === item.to ? "bg-gray-700" : ""
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 hover:bg-red-600 text-white p-2 rounded flex items-center justify-center"
        >
          <FiLogOut className="mr-2" />
          {!collapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
