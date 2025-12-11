
import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../context/userContext";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface Video {
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
  createdAt: string;
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

interface Athlete {
  athleteId: number;
  name: string;
  sportId: number;
  profile: string;
  gender: string;
  createdAt: string;
}

interface VideoCategory {
  categoryId: number;
  name: string;
}

interface VideoSubCategory {
  subCategoryId: number;
  name: string;
}

// Custom debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ReadyVideoTable: React.FC = () => {
  const { userDetails } = useUser();
  const token = userDetails?.accessToken;
  const userId = userDetails?.user.userId;

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<keyof Video | null>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");
  const [filters, setFilters] = useState<{
    title: string;
    athleteId: number | null;
    categoryId: number | null;
    subCategoryId: number | null;
  }>({
    title: "",
    athleteId: null,
    categoryId: null,
    subCategoryId: null,
  });
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [subCategories, setSubCategories] = useState<VideoSubCategory[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Debounce title input
  const debouncedTitle = useDebounce(filters.title, 500);

  // Fetch athletes and categories
  useEffect(() => {
    const fetchFilters = async () => {
      if (!token || !userId) {
        setFilterError("Authentication details missing");
        return;
      }

      setFilterLoading(true);
      try {
        const [athleteRes, categoryRes] = await Promise.all([
          fetch("https://dev.yama.maizelab-cloud.com/api/v1/athlete/", {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-userId": userId,
            },
          }),
          fetch("https://dev.yama.maizelab-cloud.com/api/v1/videoCategory/", {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-userId": userId,
            },
          }),
        ]);

        if (athleteRes.ok) {
          const athleteData = await athleteRes.json();
          setAthletes(athleteData.athletes || []);
        } else {
          throw new Error("Failed to fetch athletes");
        }

        if (categoryRes.ok) {
          const categoryData = await categoryRes.json();
          setCategories(categoryData.sports || []);
        } else {
          throw new Error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching filters:", error);
        setFilterError("Failed to load filter options.");
      } finally {
        setFilterLoading(false);
      }
    };

    fetchFilters();
  }, [token, userId]);

  // Fetch subcategories when categoryId changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!token || !userId || !filters.categoryId) {
        setSubCategories([]);
        return;
      }

      setFilterLoading(true);
      try {
        const response = await fetch(
          `https://dev.yama.maizelab-cloud.com/api/v1/videoSubCategory/${filters.categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-userId": userId,
            },
          }
        );

        if (response.ok) {
          const subCategoryData = await response.json();
          setSubCategories(subCategoryData.videoSubCategories || []);
        } else {
          throw new Error("Failed to fetch subcategories");
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setFilterError("Failed to load subcategories.");
      } finally {
        setFilterLoading(false);
      }
    };

    fetchSubCategories();
    setFilters((prev) => ({ ...prev, subCategoryId: null }));
  }, [token, userId, filters.categoryId]);

  // Fetch videos with filters and sorting
  useEffect(() => {
    if (!token || !userId) {
      setError("Authentication details missing");
      setLoading(false);
      return;
    }

    const fetchVideos = async () => {
      setLoading(true);
      try {
        const body: any = {
          page: currentPage,
          limit: pageSize,
          sortBy: sortField || "createdAt",
          sortDirection: sortOrder || "desc",
        };

        if (debouncedTitle) body.title = debouncedTitle;
        if (filters.athleteId) body.athleteId = filters.athleteId;
        if (filters.categoryId) body.categoryId = filters.categoryId;
        if (filters.subCategoryId) body.subCategoryId = filters.subCategoryId;

        const response = await fetch(
          "https://dev.yama.maizelab-cloud.com/api/v1/admin/videos",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "x-userId": userId,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        const validVideos = data.details.videos.filter(
          (video) => video.videoId && !isNaN(parseInt(video.videoId))
        );

        setVideos(validVideos);
        setTotalPages(data.details.pagination.totalPages);
      } catch (error: any) {
        console.error("Fetch Error:", error);
        setError("Failed to load videos.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [token, userId, currentPage, pageSize, sortField, sortOrder, debouncedTitle, filters.athleteId, filters.categoryId, filters.subCategoryId]);

  const handleSort = (field: keyof Video) => {
    if (sortField === field ) {
      const next =
        sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc";
      setSortOrder(next);
      if (!next) setSortField(null);
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (key: keyof Video) => {
    if (!sortField || sortField !== key) {
      return <ChevronsUpDown className="w-4 h-4 ml-1 inline text-gray-400" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 ml-1 inline text-blue-500" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 inline text-blue-500" />
    );
  };

  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log(`Filter changed: ${name} = ${value}`);
    setFilters((prev) => ({
      ...prev,
      [name]: value === "" ? null : name === "title" ? value : parseInt(value),
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      title: "",
      athleteId: null,
      categoryId: null,
      subCategoryId: null,
    });
    setCurrentPage(1);
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns: { key: keyof Video; label: string }[] = [
    { key: "videoId", label: "ID" },
    { key: "title", label: "Title" },
    { key: "athleteName", label: "Athlete" },
    { key: "categoryName", label: "Category" },
    { key: "subCategoryName", label: "Subcategory" },
    { key: "videoSummary", label: "Summary" },
    { key: "targetGradeCategory", label: "Grade" },
    { key: "targetGender", label: "Gender" },
    { key: "searchable", label: "Searchable" },
    { key: "url", label: "Video URL" },
    { key: "thumbNailUrl", label: "Thumbnail" },
    { key: "createdAt", label: "Created At" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Ready Video Table
      </h2>

      {/* Filter UI */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={filters.title || ""}
            onChange={handleFilterChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="Filter by title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Athlete
          </label>
          <select
            name="athleteId"
            value={filters.athleteId || ""}
            onChange={handleFilterChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            disabled={filterLoading}
          >
            <option value="">All Athletes</option>
            {athletes.map((athlete) => (
              <option key={athlete.athleteId} value={athlete.athleteId}>
                {athlete.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="categoryId"
            value={filters.categoryId || ""}
            onChange={handleFilterChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            disabled={filterLoading}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subcategory
          </label>
          <select
            name="subCategoryId"
            value={filters.subCategoryId || ""}
            onChange={handleFilterChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            disabled={!filters.categoryId || filterLoading}
          >
            <option value="">All Subcategories</option>
            {subCategories.map((sub) => (
              <option key={sub.subCategoryId} value={sub.subCategoryId}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="mb-4">
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Filters
        </button>
      </div>

      {/* Filter Error */}
      {filterError && (
        <div className="mb-4 text-red-500 text-sm">{filterError}</div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map(({ key, label }) => (
                <th
                  key={key}
                  className="p-3 border cursor-pointer whitespace-nowrap"
                  onClick={() => key !== "videoId" && handleSort(key)}
                >
                  {label}
                  {key !== "videoId" &&
                    key !== "thumbNailUrl" &&
                    key !== "url" &&
                    getSortIcon(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center border">
                  <div className="flex justify-center items-center">
                    <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                    <span className="ml-2 text-blue-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 border text-red-500 text-center"
                >
                  {error}
                </td>
              </tr>
            ) : videos.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 border text-gray-500 text-center"
                >
                  No videos found.
                </td>
              </tr>
            ) : (
              videos.map((video) => (
                <tr key={video.videoId} className="hover:bg-gray-50">
                  <td className="p-3 min-w-[100px] border">
                    T-{video.videoId.padStart(4, "0")}
                  </td>
                  <td className="p-3 border">{video.title}</td>
                  <td className="p-3 min-w-[200px] border">
                    {video.athleteName}
                  </td>
                  <td className="p-3 border min-w-[150px]">
                    {video.categoryName}
                  </td>
                  <td className="p-3 border min-w-[150px]">
                    {video.subCategoryName}
                  </td>
                  <td className="p-3 min-w-[300px] border">
                    {video.videoSummary}
                  </td>
                  <td className="p-3 border">{video.targetGradeCategory}</td>
                  <td className="p-3 border">{video.targetGender}</td>
                  <td className="p-3 border">
                    {video.searchable ? "Yes" : "No"}
                  </td>
                  <td className="p-3 border">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </td>
                  <td className="p-3 border">
                    <a
                      href={video.thumbNailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </td>
                  <td className="p-3 border">{formatDate(video.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600"
        >
          Next
        </button>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="p-2 border border-gray-300 rounded"
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ReadyVideoTable;
