import {
  ArrowLeft,
  BadgeInfo,
  Download,
  Edit3,
  Eye,
  Mail,
  Phone,
  PlayCircle,
  Save,
  Trash2,
  Upload,
  VideoIcon
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
}

interface Category {
  categoryId: number;
  name: string;
}

interface SubCategory {
  subCategoryId: number;
  name: string;
}

// Delete Confirmation Component
interface DeleteConfirmProps {
  video: Video;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const DeleteConfirmation: React.FC<DeleteConfirmProps> = ({
  video,
  onConfirm,
  onCancel,
  loading,
}) => (
  <div
    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 z-50 border-2 border-red-200 shadow-2xl min-w-80"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
        <Trash2 className="h-6 w-6 text-red-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Video</h3>
      <p className="text-sm text-gray-600 mb-6">
        Are you sure you want to delete{" "}
        <strong>T-{video.id.toString().padStart(4, "0")}</strong>? This action
        cannot be undone and you will be redirected back.
      </p>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

const VideoDetails: React.FC = () => {
  const { userDetails } = useUser();
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = userDetails?.accessToken;
  const userId = userDetails?.user.userId;
  const video: Video | undefined = state?.video;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const [formData, setFormData] = useState({
    title: video?.title || "",
    videoSummary: video?.summary || "",
    searchable: video?.searchable || false,
    categoryId: 0,
    subCategoryId: 0,
    targetGradeCategory: video?.grade || "",
    targetGender: video?.gender || "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // ... (keep all your existing useEffect hooks and functions)
  useEffect(() => {
    const fetchCategories = async () => {
      if (!token || !userId) {
        setFilterError("Authentication details missing");
        return;
      }

      setFilterLoading(true);
      try {
        const categoryRes = await fetch(
          `${BASE_URL}/api/v1/videoCategory/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-userId": userId,
            },
          }
        );

        if (categoryRes.ok) {
          const categoryData = await categoryRes.json();
          setCategories(categoryData.sports || []);
        } else {
          throw new Error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setFilterError("Failed to load category options.");
      } finally {
        setFilterLoading(false);
      }
    };

    fetchCategories();
  }, [token, userId]);

  useEffect(() => {
    let ignore = false;

    const fetchSubCategories = async () => {
      if (!token || !userId || !formData.categoryId) {
        if (!ignore) setSubCategories([]);
        return;
      }

      console.log(
        "Fetching subcategories for categoryId:",
        formData.categoryId
      );
      setFilterLoading(true);
      try {
        const subCategoryRes = await fetch(
          `${BASE_URL}/api/v1/videoSubCategory/${formData.categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-userId": userId,
            },
          }
        );

        if (subCategoryRes.ok) {
          const subCategoryData = await subCategoryRes.json();
          if (!ignore)
            setSubCategories(subCategoryData.videoSubCategories || []);
        } else {
          throw new Error("Failed to fetch subcategories");
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        if (!ignore) setFilterError("Failed to load subcategory options.");
      } finally {
        if (!ignore) setFilterLoading(false);
      }
    };

    fetchSubCategories();
    return () => {
      ignore = true;
    };
  }, [token, userId, formData.categoryId]);

  // Prefill categoryId from video once categories are loaded
  useEffect(() => {
    if (!video || categories.length === 0) return;

    setFormData((prev) => {
      // Prefer ids from video; otherwise map by name
      const nextCategoryId =
        video.categoryId ??
        categories.find((c) => c.name === video.category)?.categoryId ??
        0;

      // Only update if not already set or differs
      if (prev.categoryId === nextCategoryId) return prev;

      return {
        ...prev,
        categoryId: nextCategoryId,
        // reset subCategoryId so the next effect can fill it after fetch
        subCategoryId: 0,
      };
    });
  }, [video, categories]);

  // Prefill subCategoryId from video once subCategories for current category are loaded
  useEffect(() => {
    if (!video || subCategories.length === 0 || !formData.categoryId) return;

    setFormData((prev) => {
      // Only attempt if the current subcategories belong to the selected category
      const nextSubCategoryId =
        video.subCategoryId ??
        subCategories.find((s) => s.name === video.subcategory)
          ?.subCategoryId ??
        0;

      if (prev.subCategoryId === nextSubCategoryId) return prev;

      return {
        ...prev,
        subCategoryId: nextSubCategoryId,
      };
    });
  }, [video, subCategories, formData.categoryId]);

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
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.categoryId) errors.categoryId = "Category is required";
    if (!formData.subCategoryId && formData.categoryId)
      errors.subCategoryId = "Subcategory is required";
    if (!formData.targetGradeCategory)
      errors.targetGradeCategory = "Grade is required";
    if (!formData.targetGender) errors.targetGender = "Gender is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "categoryId") {
      const categoryId = parseInt(value) || 0;
      console.log("value:", name, value);
      console.log("Parsed categoryId:", categoryId);
      console.log("Updating categoryId to:", categoryId);
      setFormData((prev) => ({
        ...prev,
        categoryId,
        subCategoryId: 0,
      }));
    } else if (name === "subCategoryId") {
      const subCategoryId = parseInt(value, 10) || 0;
      console.log("Updating subCategoryId to:", subCategoryId);
      setFormData((prev) => ({
        ...prev,
        subCategoryId,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSearchableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, searchable: e.target.checked }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setThumbnailFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    try {
      // Get signed URL
      const signedUrlRes = await fetch(
        `${BASE_URL}/api/v1/uploads/videoSignedUrls`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-userid": userId ? String(userId) : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thumbNailFilename: file.name.replace(/\s+/g, "_"),
            thumbNailType: file.type,
          }),
        }
      );

      if (!signedUrlRes.ok) {
        throw new Error("Failed to get signed URL");
      }

      const signedUrlData = await signedUrlRes.json();
      console.log("Signed URL response:", signedUrlData);

      const uploadUrl = signedUrlData.imageUpload?.url;

      if (!uploadUrl) {
        throw new Error("No upload URL received");
      }

      // Upload file to signed URL using PUT
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error(
          `Failed to upload thumbnail: ${uploadRes.status} ${uploadRes.statusText}`
        );
      }

      // Construct the clean public URL without spaces and properly encoded
      const url = new URL(uploadUrl);
      const pathname = url.pathname;

      // Remove query parameters and construct clean URL
      const baseUrl = `${url.protocol}//${url.host}${pathname}`;

      console.log("Final thumbnail URL:", baseUrl);

      return baseUrl;
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (!token || !userId) {
      setError("Authentication details missing");
      return;
    }

    setFilterLoading(true);
    setIsUploadingThumbnail(!!thumbnailFile);

    try {
      let newThumbnailUrl = video.thumbnail || "";

      // Upload new thumbnail if selected
      if (thumbnailFile) {
        newThumbnailUrl = await uploadThumbnail(thumbnailFile);
      }

      // Clean the old thumbnail URL by removing spaces and properly encoding
      const cleanOldThumbnailUrl = video.thumbnail
        ? video.thumbnail.replace(/\s+/g, "%20")
        : "";

      // Prepare the update payload
      const updatePayload = {
        videoId: video.id.toString(),
        athleteId: video.athleteId,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        title: formData.title,
        videoSummary: formData.videoSummary,
        targetGradeCategory: formData.targetGradeCategory,
        targetGender: formData.targetGender,
        searchable: formData.searchable,
        // Only include thumbnail URLs if there's a change
        ...(thumbnailFile && {
          thumbNailUrl: {
            old: cleanOldThumbnailUrl,
            new: newThumbnailUrl,
          },
        }),
      };

      console.log("Update payload:", updatePayload);

      const response = await fetch(
        `${BASE_URL}/api/v1/admin/updateVideo`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-userid": userId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update failed:", response.status, errorText);
        throw new Error(
          `HTTP error! Status: ${response.status} - ${errorText}`
        );
      }

      setIsEditing(false);
      // Reset thumbnail states
      setThumbnailFile(null);
      setThumbnailPreview(null);
      navigate(-1);
    } catch (error: any) { // eslint-disable-line
      console.error("Error updating video:", error);
      setError(`Failed to save changes: ${error.message}`);
    } finally {
      setFilterLoading(false);
      setIsUploadingThumbnail(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !userId) {
      setError("Authentication details missing");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/admin/video/${video.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-userid": userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Successfully deleted, navigate back
      navigate(-1);
    } catch (error: any) { // eslint-disable-line
      console.error("Error deleting video:", error);
      setError("Failed to delete video. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
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
              <VideoIcon className="w-8 h-8 text-blue-600" />
              {video.title || `Video #${video.id}`}
            </h1>

            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                T-{video.id.toString().padStart(4, "0")}
              </span>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Edit3 className="w-4 h-4" />
                {isEditing ? "Cancel Edit" : "Edit Video"}
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {filterError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {filterError}
          </div>
        )}

        {/* Video Player */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="aspect-video relative">
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
            ) : video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title || "Video thumbnail"}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={video.url}
                controls
                className="w-full h-full object-contain"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            )}

            {/* Thumbnail Upload Button - Only show in edit mode */}
            {isEditing && (
              <div className="absolute top-4 right-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleThumbnailChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-colors duration-200"
                  title="Change thumbnail"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload Progress Indicator */}
            {isUploadingThumbnail && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="bg-white p-4 rounded-lg flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Uploading thumbnail...</span>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Info */}
          {isEditing && thumbnailFile && (
            <div className="p-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Selected:</strong> {thumbnailFile.name}
                </p>
                <p>
                  <strong>Size:</strong>{" "}
                  {(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Video Information Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.title ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter video title"
                    />
                    {formErrors.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.title}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="font-semibold">
                    {video.title || "Untitled Video"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary
                </label>
                {isEditing ? (
                  <textarea
                    name="videoSummary"
                    value={formData.videoSummary}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter video summary"
                  />
                ) : (
                  <p className="text-gray-600">
                    {video.summary || "No summary provided"}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Searchable</p>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      name="searchable"
                      checked={formData.searchable}
                      onChange={handleSearchableChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  ) : (
                    <p className="font-semibold">
                      {video.searchable ? "Yes" : "No"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Category Information */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Category Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <div>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                        formErrors.categoryId
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={filterLoading}
                    >
                      <option value={0} disabled>
                        Select Category
                      </option>
                      {categories.map((category) => (
                        <option
                          key={category.categoryId}
                          value={category.categoryId}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.categoryId && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.categoryId}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="font-semibold">{video.category || "N/A"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <div>
                    <select
                      name="subCategoryId"
                      value={formData.subCategoryId}
                      onChange={handleInputChange}
                      className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                        formErrors.subCategoryId
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={!formData.categoryId || filterLoading}
                    >
                      <option value={0} disabled>
                        Select Subcategory
                      </option>
                      {subCategories.map((sub) => (
                        <option
                          key={sub.subCategoryId}
                          value={sub.subCategoryId}
                        >
                          {sub.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.subCategoryId && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.subCategoryId}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="font-semibold">{video.subcategory || "N/A"}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <div>
                      <select
                        name="targetGradeCategory"
                        value={formData.targetGradeCategory}
                        onChange={handleInputChange}
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                          formErrors.targetGradeCategory
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="" disabled>
                          Select Grade
                        </option>
                        {["Kid", "Junior", "Senior"].map((grade) => (
                          <option key={grade} value={grade.toLowerCase()}>
                            {grade}
                          </option>
                        ))}
                      </select>
                      {formErrors.targetGradeCategory && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.targetGradeCategory}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="font-semibold">{video.grade || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <div>
                      <select
                        name="targetGender"
                        value={formData.targetGender}
                        onChange={handleInputChange}
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                          formErrors.targetGender
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="" disabled>
                          Select Gender
                        </option>
                        {["Male", "Female", "Other"].map((gender) => (
                          <option key={gender} value={gender.toLowerCase()}>
                            {gender}
                          </option>
                        ))}
                      </select>
                      {formErrors.targetGender && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.targetGender}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="font-semibold">{video.gender || "-"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>

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

              {video.athlete && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <BadgeInfo className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Athlete</p>
                    <p className="font-semibold">🏅 {video.athlete}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Additional Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <VideoIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Video URL</p>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 hover:text-blue-800 transition break-all"
                  >
                    View Video
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          {isEditing && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              disabled={filterLoading || isUploadingThumbnail}
            >
              <Save className="w-5 h-5" />
              {isUploadingThumbnail ? "Uploading..." : "Save Changes"}
            </button>
          )}

          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
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

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <DeleteConfirmation
          video={video}
          loading={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

export default VideoDetails;
