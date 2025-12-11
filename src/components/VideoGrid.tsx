import React from "react";
import { Link } from "react-router-dom";
import { PlayCircle, Download, VideoIcon, BadgeInfo } from "lucide-react";

interface Video {
  id: number;
  contactNumber?: string;
  emailId?: string;
  athlete?: string;
  category?: string;
  subcategory?: string;
  grade?: string;
  gender?: string;
  url: string;
  title?: string;
  summary?: string;
  thumbnail?: string;
  searchable?: boolean;
}

interface Props {
  title: string;
  videos: Video[];
}

const VideoGrid: React.FC<Props> = ({ title, videos }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <Link
            to={`/videos/${v.id}`}
            state={{ video: v }}
            key={v.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition"
          >
            {/* Thumbnail or fallback */}
            <div className="relative">
              {v.thumbnail ? (
                <img
                  src={v.thumbnail}
                  alt={v.title || "Video thumbnail"}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <video
                  src={v.url}
                  controls
                  className="w-full h-48 object-contain"
                />
              )}
              <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                T-{v.id.toString().padStart(4, "0")}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-1">
                <VideoIcon className="w-4 h-4 text-gray-500" />
                {v.title || "Untitled Video"}
              </h3>

              {v.summary && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  <BadgeInfo className="w-4 h-4 inline-block text-gray-400 mr-1" />
                  {v.summary}
                </p>
              )}

              <div className="text-sm text-gray-600">
                {v.athlete && (
                  <p>
                    🏅 <strong>{v.athlete}</strong>
                  </p>
                )}
                {(v.category || v.subcategory) && (
                  <p>
                    📂 {v.category || "N/A"} » {v.subcategory || "N/A"}
                  </p>
                )}
                {(v.grade || v.gender) && (
                  <p>
                    🎓 Grade: {v.grade || "-"} | 🚻 Gender: {v.gender || "-"}
                  </p>
                )}
              </div>

              {(v.contactNumber || v.emailId) && (
                <div className="text-xs text-gray-500 mt-1">
                  {v.contactNumber && <p>📞 {v.contactNumber}</p>}
                  {v.emailId && <p>✉️ {v.emailId}</p>}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex justify-center items-center gap-1 text-sm px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PlayCircle className="w-4 h-4" />
                  Watch
                </a>
                <a
                  href={v.url}
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

export default VideoGrid;
