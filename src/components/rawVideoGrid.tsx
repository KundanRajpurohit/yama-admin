import { Calendar, Download, Eye, PlayCircle, VideoIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

interface RawVideo {
  id: number;
  contactNumber: string;
  emailId: string;
  url: string;
  reviewStatus: "nonreviewed" | "approved" | "rejected";
  createdAt: string;
}

interface Props {
  title: string;
  videos: RawVideo[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "nonreviewed":
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const RawVideoGrid: React.FC<Props> = ({ title, videos }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Link
            to={`/raw-videos/${video.id}`}
            state={{ video }}
            key={video.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition"
          >
            {/* Video Preview */}
            <div className="relative">
              <video
                src={video.url}
                className="w-full h-48 object-cover"
                muted
              />
              <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                RAW-{video.id.toString().padStart(4, "0")}
              </span>
              <span
                className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full shadow capitalize ${getStatusColor(
                  video.reviewStatus
                )}`}
              >
                {video.reviewStatus}
              </span>
            </div>

            <div className="p-4 space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-gray-500" />
                Raw Video #{video.id}
              </h3>

              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(video.createdAt)}
                </p>

                <p className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-gray-400" />
                  Status:{" "}
                  <span className="capitalize font-medium">
                    {video.reviewStatus}
                  </span>
                </p>
              </div>

              {(video.contactNumber || video.emailId) && (
                <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
                  {video.contactNumber && <p>📞 {video.contactNumber}</p>}
                  {video.emailId && <p>✉️ {video.emailId}</p>}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex justify-center items-center gap-1 text-sm px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PlayCircle className="w-4 h-4" />
                  Watch
                </a>
                <a
                  href={video.url}
                  download
                  className="flex-1 inline-flex justify-center items-center gap-1 text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RawVideoGrid;
