import axios from "axios";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import AthleteManager from "../components/AthleteManager";
import SportManager from "../components/SportManager";
import VideoCategorySubCategoryManager from "../components/VideoCategoryManager";
import { useUser } from "../context/userContext";

interface Athlete {
  athleteId: number;
  name: string;
  sportId: number;
  profile: string;
  gender: string;
  createdAt: string;
}

interface Sport {
  sportId: number;
  name: string;
}

interface VideoCategory {
  categoryId: number;
  name: string;
}

interface VideoSubCategory {
  subCategoryId: number;
  name: string;
}

const UploadVideo: React.FC = () => {
  const { userDetails } = useUser();
  const authToken = userDetails?.accessToken || "";
  const userId = userDetails?.user.userId || "";
  const [formData, setFormData] = useState({
    athleteId: "",
    videoCategory: "",
    subCategory: "",
    summary: "",
    grade: "",
    gender: "",
    searchable: "",
    publicPreview: "",
    plateform: "all",
    isWelcoming: false,
    title: "",
  });

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
  const [videoSubCategories, setVideoSubCategories] = useState<VideoSubCategory[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const PART_SIZE = 80 * 1024 * 1024; // 80MB per part

  // Fetch athletes, sports, and video categories
  useEffect(() => {
    const fetchAthletes = async () => {
      setIsLoading(true);
      try {
        console.log(sports);
        const response = await fetch(`${API_BASE_URL}/api/v1/athlete/`, {
          headers: {
            "x-userid": userId,
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        setAthletes(data.athletes || []);
      } catch (error) {
        console.error("Error fetching athletes:", error);
        setError("Failed to load athletes");
      }
    };
    const fetchSports = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/sports`, {
          headers: {
            "x-userid": userId,
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        setSports(data.sports || []);
      } catch (error) {
        console.error("Error fetching sports:", error);
        setError("Failed to load sports");
      }
    };
    const fetchVideoCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/videoCategory/`, {
          headers: {
            "x-userid": userId,
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        setVideoCategories(data.sports || []); // Note: API response key might need correction
      } catch (error) {
        console.error("Error fetching video categories:", error);
        setError("Failed to load video categories");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAthletes();
    fetchSports();
    fetchVideoCategories();
  }, [authToken, userId]);

  // Fetch subcategories when videoCategory changes
  useEffect(() => {
    const fetchVideoSubCategories = async () => {
      if (!formData.videoCategory) {
        setVideoSubCategories([]);
        setFormData((prev) => ({ ...prev, subCategory: "" }));
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/videoSubCategory/${formData.videoCategory}`,
          {
            headers: {
              "x-userid": userId,
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const data = await response.json();
        setVideoSubCategories(data.videoSubCategories || []);
        setFormData((prev) => ({ ...prev, subCategory: "" })); // Reset subcategory when category changes
      } catch (error) {
        console.error("Error fetching video sub-categories:", error);
        setError("Failed to load video sub-categories");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideoSubCategories();
  }, [formData.videoCategory, authToken, userId]);

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [videoPreview, thumbnailPreview]);

  // Handle video file selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setUploadProgress(0);
      setError(null);
    }
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Handle drag-and-drop for video
  const handleVideoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && ["video/mp4", "video/mov", "video/avi"].includes(file.type)) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setUploadProgress(0);
      setError(null);
    }
  };

  // Handle drag-and-drop for thumbnail
  const handleThumbnailDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && ["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Prevent default drag behavior
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Clear video preview
  const clearVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  // Clear thumbnail preview
  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectAthlete = (athleteId: string) => {
    setFormData((prev) => ({ ...prev, athleteId }));
  };

  const handleSelectSport = (sportId: string) => {
    setFormData((prev) => ({ ...prev, sportId }));
  };

  const handleSelectVideoSubCategory = (subCategoryId: string) => {
    setFormData((prev) => ({ ...prev, subCategory: subCategoryId }));
  };

  const getFileType = (file: File): string => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return ["mov", "m4v"].includes(extension || "")
      ? "video/quicktime"
      : "video/mp4";
  };

  // Split video into parts
  const splitFileIntoParts = (file: File): Blob[] => {
    const parts: Blob[] = [];
    const partCount = Math.ceil(file.size / PART_SIZE);
    for (let i = 0; i < partCount; i++) {
      const start = i * PART_SIZE;
      const end = Math.min(start + PART_SIZE, file.size);
      parts.push(file.slice(start, end));
    }
    return parts;
  };

  // Get presigned URLs
  const getPresignedUrls = async (
    partCount: number,
    videoName: string,
    videoType: string
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/uploads/videoSignedUrls`,
        {
          videoFilename: videoName,
          videoType,
          videoPartCount: partCount,
          thumbNailFilename:
            thumbnailFile?.name || `${videoName.split(".")[0]}.png`,
          thumbNailType: "image/png",
        },
        {
          headers: {
            "x-userid": userId,
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) { // eslint-disable-line
      const message = error.response?.data

        ?.message || error.message;
      throw new Error(`Failed to get presigned URLs: ${message}`);
    }
  };

  // Upload video parts
  const uploadVideoParts = async (
    parts: Blob[],
    uploadUrls: { partNumber: number; signedUrl: string }[],
    fileType: string,
    totalSize: number,
    totalProgressWeight: number
  ) => {
    const etags: { PartNumber: number; ETag: string }[] = [];
    let totalLoaded = 0;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const { partNumber, signedUrl } = uploadUrls[i];

      try {
        const response = await axios.put(signedUrl, part, {
          headers: {
            "Content-Type": fileType,
            "Content-Length": part.size.toString(),
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const partLoaded = progressEvent.loaded;
              const videoProgress =
                ((totalLoaded + partLoaded) / totalSize) * 90; // Video is 90% of total progress
              setUploadProgress(
                Math.min(
                  Math.round((videoProgress / totalProgressWeight) * 100),
                  90
                )
              );
            }
          },
        });

        totalLoaded += part.size;
        setUploadProgress(
          Math.min(
            Math.round(
              (((totalLoaded / totalSize) * 90) / totalProgressWeight) * 100
            ),
            90
          )
        );

        etags.push({
          PartNumber: partNumber,
          ETag: response.headers.etag || "",
        });
      } catch (error: any) { // eslint-disable-line
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to upload part ${partNumber}: ${message}`);
      }
    }

    return etags;
  };

  // Upload thumbnail
  const uploadThumbnail = async (
    thumbnail: File,
    signedUrl: string,
    totalSize: number,
    totalProgressWeight: number
  ) => {
    try {
      console.log(totalSize);

      await axios.put(signedUrl, thumbnail, {
        headers: {
          "Content-Type": "image/png",
          "Content-Length": thumbnail.size.toString(),
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const thumbnailProgress =
              (progressEvent.loaded / progressEvent.total) * 10; // Thumbnail is 10% of total progress
            setUploadProgress(
              Math.min(
                90 +
                Math.round((thumbnailProgress / totalProgressWeight) * 100),
                100
              )
            );
          }
        },
      });
    } catch (error: any) { // eslint-disable-line
      const message = error.response?.data?.message || error.message;
      throw new Error(`Failed to upload thumbnail: ${message}`);
    }
  };

  // Complete upload
  const completeUpload = async (payload: {
    uploadId: string;
    fileName: string;
    parts: { PartNumber: number; ETag: string }[];
    thumbnailKey: string;
    athleteId: number;
    categoryId: number;
    subCategoryId: number;
    title: string;
    videoSummary: string;
    targetGradeCategory: string;
    targetGender: string;
    searchable: boolean;
    publicPreview: boolean,
    plateform: string
    isWelcoming: boolean;
  }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/uploads/video`,
        payload,
        {
          headers: {
            "x-userid": userId,
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) { // eslint-disable-line
      const message = error.response?.data?.message || error.message;
      throw new Error(`Failed to complete upload: ${message}`);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      setError("Please select a video file");
      return;
    }
    if (!thumbnailFile) {
      setError("Please select a thumbnail file");
      return;
    }
    if (
      !formData.athleteId ||
      // !formData.sportId ||
      !formData.videoCategory ||
      !formData.subCategory ||
      !formData.summary ||
      !formData.grade ||
      !formData.gender ||
      !formData.searchable ||
      !formData.title ||
      !formData.isWelcoming
    ) {
      setError("Please fill out all required fields");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const videoType = getFileType(videoFile);
      const videoParts = splitFileIntoParts(videoFile);
      if (videoParts.length === 0) {
        setError("No video data to upload");
        setUploading(false);
        return;
      }

      // Get presigned URLs
      const { videoUpload, imageUpload } = await getPresignedUrls(
        videoParts.length,
        videoFile.name,
        videoType
      );

      // Calculate total size for progress tracking
      const totalSize =
        videoParts.reduce((sum, part) => sum + part.size, 0) +
        (thumbnailFile?.size || 0);
      const totalProgressWeight = 100; // Normalize to 100%

      // Upload video parts
      const uploadedVideoParts = await uploadVideoParts(
        videoParts,
        videoUpload.parts,
        videoType,
        totalSize,
        totalProgressWeight
      );

      // Upload thumbnail
      await uploadThumbnail(
        thumbnailFile,
        imageUpload.url,
        totalSize,
        totalProgressWeight
      );

      // Complete upload
      const payload = {
        uploadId: videoUpload.uploadId,
        fileName: videoUpload.key,
        parts: uploadedVideoParts,
        thumbnailKey: imageUpload.key,
        athleteId: parseInt(formData.athleteId),
        categoryId: parseInt(formData.videoCategory),
        subCategoryId: parseInt(formData.subCategory),
        title: formData.title,
        videoSummary: formData.summary,
        targetGradeCategory: formData.grade,
        targetGender: formData.gender,
        searchable: formData.searchable === "Yes",
        publicPreview: formData.publicPreview === "Yes",
        plateform: formData.plateform,
        isWelcoming: formData.isWelcoming,
      };

      await completeUpload(payload);
      setError(null);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#9333ea", "#14b8a6", "#ffffff"],
      });

      // Reset form
      setTimeout(() => {
        setFormData({
          athleteId: "",
          // sportId: "",
          videoCategory: "",
          subCategory: "",
          summary: "",
          grade: "",
          gender: "",
          searchable: "",
          publicPreview: "",
          plateform: "all",
          title: "",
          isWelcoming: false,
        });
        setVideoFile(null);
        setThumbnailFile(null);
        setVideoPreview(null);
        setThumbnailPreview(null);
        if (videoInputRef.current) videoInputRef.current.value = "";
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
      }, 5000);
    } catch (error: any) { // eslint-disable-line
      const errorMessage = error.message || "Unknown error";
      setError(`Failed to upload: ${errorMessage}. Please try again.`);
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Upload New Video
        </h1>
        {isLoading && (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Manager Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <AthleteManager onSelectAthlete={handleSelectAthlete} />
          <SportManager onSelectSport={handleSelectSport} />
          <VideoCategorySubCategoryManager
            onSelectVideoSubCategory={handleSelectVideoSubCategory}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Left Column: Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Athlete Name
              </label>
              <select
                name="athleteId"
                value={formData.athleteId}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              >
                <option value="">Select Athlete</option>
                {athletes.map((athlete) => (
                  <option key={athlete.athleteId} value={athlete.athleteId}>
                    {athlete.name}
                  </option>
                ))}
              </select>
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sport
              </label>
              <select
                name="sportId"
                value={formData.sportId}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              >
                <option value="">Select Sport</option>
                {sports.map((sport) => (
                  <option key={sport.sportId} value={sport.sportId}>
                    {sport.name}
                  </option>
                ))}
              </select>
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Category
              </label>
              <select
                name="videoCategory"
                value={formData.videoCategory}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              >
                <option value="">Select Video Category</option>
                {videoCategories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Category
              </label>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
                disabled={!formData.videoCategory}
              >
                <option value="">Select Sub Category</option>
                {videoSubCategories.map((subCategory) => (
                  <option
                    key={subCategory.subCategoryId}
                    value={subCategory.subCategoryId}
                  >
                    {subCategory.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Summary
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Grade
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              >
                <option value="">Select Grade</option>
                <option value="kid">Kids</option>
                <option value="youngster">Youngster</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Searchable
              </label>
              <select
                name="searchable"
                value={formData.searchable}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Public Preview
              </label>
              <select
                name="publicPreview"
                value={formData.publicPreview}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                name="plateform"
                value={formData.plateform}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              >
                <option value="all">All</option>
                <option value="web">Web</option>
                <option value="app">App</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Welcoming Video
              </label>
              <select
                name="isWelcoming"
                value={formData.isWelcoming ? "true" : "false"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isWelcoming: e.target.value === "true",
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>

          {/* Right Column: File Uploads and Previews */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Video
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition"
                onDragOver={handleDragOver}
                onDrop={handleVideoDrop}
              >
                <input
                  type="file"
                  accept=".mp4,.mov,.avi"
                  onChange={handleVideoChange}
                  className="hidden"
                  ref={videoInputRef}
                />
                <p className="text-gray-500 mb-2">
                  Drag and drop your video here or{" "}
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="text-blue-600 hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-400">
                  Supports: .mp4, .mov, .avi
                </p>
              </div>
              {videoPreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Video Preview
                  </p>
                  <div className="relative">
                    <video
                      ref={videoRef}
                      src={videoPreview}
                      controls
                      className="w-full rounded-lg shadow-md"
                      style={{ maxHeight: "200px" }}
                    />
                    <button
                      type="button"
                      onClick={clearVideo}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      disabled={uploading}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Thumbnail
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition"
                onDragOver={handleDragOver}
                onDrop={handleThumbnailDrop}
              >
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  ref={thumbnailInputRef}
                />
                <p className="text-gray-500 mb-2">
                  Drag and drop your thumbnail here or{" "}
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="text-blue-600 hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-400">
                  Supports: .jpg, .jpeg, .png
                </p>
              </div>
              {thumbnailPreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Preview
                  </p>
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="w-full rounded-lg shadow-md"
                      style={{ maxHeight: "200px" }}
                    />
                    <button
                      type="button"
                      onClick={clearThumbnail}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      disabled={uploading}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar and Submit Button */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            {uploading && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Upload Progress
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {uploadProgress}% Complete
                </p>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={uploading || isLoading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {uploading ? "Uploading..." : "Save Video"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default UploadVideo;