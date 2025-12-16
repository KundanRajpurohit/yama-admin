import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileVideo,
  RefreshCw,
  VideoIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import RawVideoGrid from "../components/rawVideoGrid";
import { useUser } from "../context/userContext";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;
interface RawVideo {
  id: number;
  contactNumber: string;
  emailId: string;
  url: string;
  reviewStatus: "nonreviewed" | "approved" | "rejected";
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

interface ApiResponse {
  message: string;
  details: {
    videos: RawVideo[];
    pagination: Pagination;
  };
}

const RawVideos: React.FC = () => {
  const { userDetails } = useUser();
  const token = userDetails?.accessToken;
  const userId = userDetails?.user.userId;

  const [videos, setVideos] = useState<RawVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });
  const limit = 20;

  const fetchVideos = async (page: number) => {
    if (!token || !userId) {
      setError("Authentication details missing");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/admin/rawVideos?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-userid": userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch videos: ${response.status} ${response.statusText}`
        );
      }

      const data: ApiResponse = await response.json();

      if (data.message === "Success") {
        setVideos(data.details.videos || []);
        setPagination(data.details.pagination);
        setCurrentPage(page);
      } else {
        throw new Error(data.message || "Unknown error occurred");
      }
    } 
    catch (err: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Error fetching raw videos:", err);
      setError(err.message || "Failed to load raw videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(currentPage);
  }, [token, userId, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRetry = () => {
    fetchVideos(currentPage);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading raw videos...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Videos
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-6">
              <FileVideo className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No Raw Videos Found
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              There are currently no raw videos available. New videos will
              appear here once they are uploaded.
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const current = currentPage;

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, current page area, and last page
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      } else if (current >= totalPages - 3) {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <VideoIcon className="w-8 h-8 text-purple-600" />
                Raw Videos
              </h1>
              <p className="text-gray-600">
                Showing {videos.length} of {pagination.totalRecords} videos
                {pagination.totalPages > 1 &&
                  ` • Page ${currentPage} of ${pagination.totalPages}`}
              </p>
            </div>

            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <RawVideoGrid
          title="Raw videos"
          videos={videos}
    
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center">
            <nav className="flex items-center gap-1">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex">
                {generatePageNumbers().map((pageNum, index) =>
                  pageNum === -1 ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-2 text-gray-500"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium border-t border-b ${
                        pageNum === currentPage
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}

        {/* Page Info */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {pagination.totalPages} •{" "}
              {pagination.totalRecords} total videos
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RawVideos;
