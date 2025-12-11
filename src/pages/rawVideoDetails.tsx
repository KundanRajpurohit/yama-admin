import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  PlayCircle,
  Download,
  Calendar,
  Eye,
  Phone,
  Mail,
  VideoIcon,
  Trash2,
} from "lucide-react";

interface RawVideo {
  id: number;
  contactNumber: string;
  emailId: string;
  url: string;
  reviewStatus: "nonreviewed" | "approved" | "rejected";
  createdAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "nonreviewed":
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
};

// ... (keep the existing RawVideo interface and getStatusColor function)

const RawVideoDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const video = location.state?.video as RawVideo;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    if (!video) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Video Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The video you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };


  // ... (keep existing formatDate function and video not found check)

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(
        `https://dev.yama.maizelab-cloud.com/api/v1/admin/rawVideo/${video.id}`,
        {
          method: "DELETE",
          headers: {
            "x-userid": "1",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzU3MjY2Njg2LCJleHAiOjE3NTc2OTg2ODZ9.eP8GjHbAiWWbN4QJ671BbVh-EsvEIFm1kqHcxpyueAg",
          },
        }
      );

      if (response.ok) {
        navigate(-1); // Go back after successful deletion
      } else {
        alert("Failed to delete video. Please try again.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting video. Please check your connection.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Delete Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Videos
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <VideoIcon className="w-8 h-8 text-purple-600" />
              Raw Video #{video.id}
            </h1>

            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize border ${getStatusColor(
                  video.reviewStatus
                )}`}
              >
                {video.reviewStatus}
              </span>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete Video
              </button>
            </div>
          </div>
        </div>
        {/* Video Player */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="aspect-video">
            <video
              src={video.url}
              controls
              className="w-full h-full object-contain"
              controlsList="nodownload"
            >
              Your browser does not support the video tag.
            </video>
          </div>
              </div>
                {/* Video Information */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <VideoIcon className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Video ID</p>
                  <p className="font-semibold">RAW-{video.id.toString().padStart(4, "0")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Upload Date</p>
                  <p className="font-semibold">{formatDate(video.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Review Status</p>
                  <p className="font-semibold capitalize">{video.reviewStatus}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            
            <div className="space-y-4">
              {video.contactNumber ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <a 
                      href={`tel:${video.contactNumber}`}
                      className="font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      {video.contactNumber}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="text-gray-400">Not provided</p>
                  </div>
                </div>
              )}

              {video.emailId ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <a 
                      href={`mailto:${video.emailId}`}
                      className="font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      {video.emailId}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="text-gray-400">Not provided</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            <PlayCircle className="w-5 h-5" />
            Open in New Tab
          </a>
          
          <a
            href={video.url}
            download
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            <Download className="w-5 h-5" />
            Download Video
          </a>
        </div>
      </div>
  

        {/* ... (keep existing video player and information sections) */}

        {/* Action Buttons - keep existing ones */}


      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 z-50 border-2 border-red-200 shadow-2xl min-w-80"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Video
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>RAW-{video.id.toString().padStart(4, "0")}</strong>? This
              action cannot be undone and you will be redirected back.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawVideoDetails;
