// import React from "react";
// import Header from "../components/Header";
// import VideoTable from "../components/VideoTable";
// import UploadPopup from "../components/UploadPopup";
// import UserData from "../components/UserData"
// import { Upload } from "lucide-react"; // optional icon lib

// const Home = () => {
//   const [isUploadOpen, setIsUploadOpen] = React.useState(false);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       <Header />

//       <div className="max-w-7xl mx-auto p-6">
//         {/* Summary Card */}
//         <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-2">
//             YAMA Admin Dashboard
//           </h2>
//           <p className="text-gray-600 mb-4">
//             A scrollable dashboard containing Raw and Ready video data.
//           </p>
//           <ul className="list-disc ml-5 text-gray-700 space-y-1">
//             <li>Raw Videos – from users</li>
//             <li>Ready Videos – curated & categorized</li>
//           </ul>
//           <p className="mt-3 text-sm text-gray-500 italic">
//             Uploading a video will open a popup to select details.
//           </p>
//         </div>

//         {/* Upload Button */}
//         <div className="flex justify-end mb-6">
//           <button
//             onClick={() => setIsUploadOpen(true)}
//             className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition shadow-md"
//           >
//             <Upload className="w-5 h-5" />
//             Upload Ready Video
//           </button>
//         </div>

//         {/* Tables */}
//         <div className="space-y-8">
//           <VideoTable title="Raw Videos" />
//           <VideoTable title="Ready Videos" />
//         </div>

//         {isUploadOpen && <UploadPopup onClose={() => setIsUploadOpen(false)} />}

//         {/* Optional User Info */}
//         <div className="mt-10">
//           <UserData />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

// src/pages/Home.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/sidebar";

const Home = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Home;
