// src/components/VideoTable.tsx
import React, { useEffect, useState } from "react";
import { useUser } from "../context/userContext";

interface Video {
  id: number;
  contactNumber: string;
  emailId: string;
  url: string;
}

interface ApiResponse {
  message: string;
  details: {
    videos: Video[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
    };
  };
}

interface Props {
  title: "Raw Videos" | "Ready Videos";
}

const VideoTable: React.FC<Props> = ({ title }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { userDetails } = useUser();
  const token = userDetails?.accessToken;
  const userId = userDetails?.user.userId;

  const limit = 10;

  useEffect(() => {
    const fetchVideos = async () => {
      if (!token || !userId) return;

      setLoading(true);
      try {
        const endpoint =
          title === "Raw Videos"
            ? `https://dev.yama.maizelab-cloud.com/api/v1/admin/rawVideos?page=${page}&limit=${limit}`
            : `https://dev.yama.maizelab-cloud.com/api/v1/admin/rawVideos?page=${page}&limit=${limit}`;

        const res = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-userid": userId,
          },
        });

        const data: ApiResponse = await res.json();
        setVideos(data.details.videos);
        setTotal(data.details.pagination.totalRecords);
        setTotalPages(data.details.pagination.totalPages);
      } catch (err: any) {
        setError("Failed to fetch videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [page, token, userId, title]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <span className="text-gray-500 text-sm">{total} videos found</span>
      </div>

      {loading ? (
        <p className="text-blue-500 text-center">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Video ID</th>
                  <th className="p-2 border">Contact No</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Preview</th>
                  <th className="p-2 border">Download</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50 justify-center items-center  transition">
                    <td className="p-2 border text-center">
                      T-{video.id.toString().padStart(4, "0")}
                    </td>
                    <td className="p-2 border">{video.contactNumber || "N/A"}</td>
                    <td className="p-2 border">{video.emailId || "N/A"}</td>
                    <td className="p-3 border ">
                      <video
                        src={video.url}
                        controls
                        className="w-40 h-24 rounded-md shadow"
                      />
                    </td>
                    <td className="p-2 border text-center">
                      <a
                        href={video.url}
                        download
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-3">
            <button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoTable;
