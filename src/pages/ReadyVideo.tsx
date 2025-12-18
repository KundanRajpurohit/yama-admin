import React, { useEffect, useState } from "react";
import VideoGrid from "../components/VideoGrid";
import { useUser } from "../context/userContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
  athleteId?: number;
  categoryId?: number;
  subCategoryId?: number;
  publicPreview?: boolean;
  plateform?: "all" | "web" | "app";
}

interface ApiResponse {
  message: string;
  details: {
    videos: {
      videoId: string;
      athleteName: string;
      categoryName: string;
      subCategoryName: string;
      videoSummary: string;
      targetGradeCategory: string;
      targetGender: string;
      searchable: boolean;
      url: string;
      thumbNailUrl: string;
      title: string;
      publicPreview?: boolean;
      plateform?: "all" | "web" | "app";
    }[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
    };
  };
}

const ReadyVideos: React.FC = () => {
  const { userDetails } = useUser();
  const token = userDetails?.accessToken;
  const userId = userDetails?.user.userId;
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;
  const sortBy = "createdAt";
  const sortDirection = "desc";

  useEffect(() => {
    if (!token || !userId) {
      setError("Authentication details missing");
      setLoading(false);
      return;
    }

    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}/api/v1/admin/videos?page=${currentPage}&limit=${limit}&sortBy=${sortBy}&sortDirection=${sortDirection}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "x-userid": userId,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              page: currentPage,
              limit,
              sortBy,
              sortDirection,
            }),
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: ApiResponse = await response.json();
        // Map API response to Video interface with validation
        const mappedVideos: Video[] = data.details.videos
          .filter((video) => {
            if (!video.videoId || isNaN(parseInt(video.videoId))) {
              console.warn(
                `Skipping video with invalid videoId: ${video.videoId}`
              );
              return false;
            }
            return true;
          })
          .map((video) => ({
            id: parseInt(video.videoId),
            contactNumber: undefined,
            emailId: undefined,
            athlete: video.athleteName,
            category: video.categoryName,
            subcategory: video.subCategoryName,
            grade: video.targetGradeCategory,
            gender: video.targetGender,
            url: video.url,
            title: video.title,
            searchable: video.searchable,
            summary: video.videoSummary,
            thumbnail: video.thumbNailUrl,
            publicPreview: video.publicPreview,
            plateform: video.plateform
          }));

        setVideos(mappedVideos);
        setTotalPages(data.details.pagination.totalPages);
        if (mappedVideos.length < data.details.videos.length) {
          setError("Some videos were skipped due to invalid data");
        }
      } catch (error: any) { // eslint-disable-line
        console.error("Error fetching videos:", error);
        setError("Failed to load videos. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [token, userId, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <p className="text-center py-10">Loading  videos…</p>;
  }

  if (error) {
    return <p className="text-center py-10 text-red-600">{error}</p>;
  }

  return (
    <div>
      <VideoGrid title="Ready Videos" videos={videos} />
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ReadyVideos;
