import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Home from "./pages/home";
import { UserProvider } from "./context/userContext";
import SidebarLayout from "./layouts/sidebar";
import Dashboard from "./pages/Dashboard";
import RawVideos from "./pages/RawVideo";
import ReadyVideos from "./pages/ReadyVideo";
import UploadVideo from "./pages/UploadVideo";
import VideoDetails from "./pages/VideoDetails";
import ProtectedRoute from "./routes/ProtectedRoutes";
import RawVideoDetails from "./pages/RawVideoDetails";

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <SidebarLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/raw-videos" element={<RawVideos />} />
            <Route path="/ready-videos" element={<ReadyVideos />} />
            <Route path="/upload" element={<UploadVideo />} />
            <Route path="/videos/:videoId" element={<VideoDetails />} />
            <Route path="/raw-videos/:videoId" element={<RawVideoDetails />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
