import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./components/login";
import { UserProvider } from "./context/userContext";
import SidebarLayout from "./layouts/sidebar";
import Dashboard from "./pages/Dashboard";
import RawVideos from "./pages/RawVideo";
import RawVideoDetails from "./pages/rawVideoDetails";
import ReadyVideos from "./pages/ReadyVideo";
import UploadVideo from "./pages/UploadVideo";
import VideoDetails from "./pages/videoDetails";
import ProtectedRoute from "./routes/ProtectedRoutes";

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
