import React, { useEffect, useState } from "react";
import { useUser } from "../context/userContext";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;
interface VideoSubCategory {
  subCategoryId: number;
  name: string;
}

interface VideoSubCategoryManagerProps {
  onSelectVideoSubCategory: (subCategoryId: string) => void;
  setVideoSubCategories: React.Dispatch<
    React.SetStateAction<VideoSubCategory[]>
  >;
}

const VideoSubCategoryManager: React.FC<VideoSubCategoryManagerProps> = ({
  onSelectVideoSubCategory,
  setVideoSubCategories,
}) => {
  const [videoSubCategories, setLocalVideoSubCategories] = useState<
    VideoSubCategory[]
    >([]);
    const { userDetails } = useUser();
    const token = userDetails?.accessToken;
    const userId = userDetails?.user.userId;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVideoSubCategory, setSelectedVideoSubCategory] =
    useState<VideoSubCategory | null>(null);
  const [newVideoSubCategory, setNewVideoSubCategory] = useState({ name: "" });
  const [isVideoSubCategoryModalOpen, setIsVideoSubCategoryModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch video sub-categories from API
  useEffect(() => {
    const fetchVideoSubCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/api/v1/videoSubCategory/`
        );
        const data = await response.json();
        setLocalVideoSubCategories(data.videoSubCategories || []);
        setVideoSubCategories(data.videoSubCategories || []);
      } catch (error) {
        console.error("Error fetching video sub-categories:", error);
        setError("Failed to load video sub-categories");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideoSubCategories();
  }, [setVideoSubCategories]);

  const handleAddVideoSubCategory = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/videoSubCategory/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
       
          Authorization: `Bearer ${token}`,
              "x-userid": userId ?? "",
          },
          body: JSON.stringify({ name: newVideoSubCategory.name }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const updatedSubCategories = [
          ...videoSubCategories,
          data.videoSubCategory,
        ];
        setLocalVideoSubCategories(updatedSubCategories);
        setVideoSubCategories(updatedSubCategories);
        setIsAddModalOpen(false);
        setNewVideoSubCategory({ name: "" });
      } else {
        console.error("Failed to add video sub-category");
        setError("Failed to add video sub-category");
      }
    } catch (error) {
      console.error("Error adding video sub-category:", error);
      setError("Error adding video sub-category");
    }
  };

  const handleEditVideoSubCategory = async () => {
    if (!selectedVideoSubCategory) return;
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/videoSubCategory/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzUwMDg5OTkwLCJleHAiOjE3NTA1MjE5OTB9.naURGqgSHcFFYNBeRpSrb_2C3vBhUrnlzQjm1RxMxBg",
          },
          body: JSON.stringify({
            subCategoryId: selectedVideoSubCategory.subCategoryId,
            name: newVideoSubCategory.name,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const updatedSubCategories = videoSubCategories.map((subCategory) =>
          subCategory.subCategoryId === selectedVideoSubCategory.subCategoryId
            ? data.videoSubCategory
            : subCategory
        );
        setLocalVideoSubCategories(updatedSubCategories);
        setVideoSubCategories(updatedSubCategories);
        setIsEditModalOpen(false);
        setNewVideoSubCategory({ name: "" });
        setSelectedVideoSubCategory(null);
      } else {
        console.error("Failed to update video sub-category");
        setError("Failed to update video sub-category");
      }
    } catch (error) {
      console.error("Error updating video sub-category:", error);
      setError("Error updating video sub-category");
    }
  };

  const handleDeleteVideoSubCategory = async () => {
    if (!selectedVideoSubCategory) return;
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/videoSubCategory/${selectedVideoSubCategory.subCategoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzUwMDg5OTkwLCJleHAiOjE3NTA1MjE5OTB9.naURGqgSHcFFYNBeRpSrb_2C3vBhUrnlzQjm1RxMxBg",
          },
        }
      );
      if (response.ok) {
        const updatedSubCategories = videoSubCategories.filter(
          (subCategory) =>
            subCategory.subCategoryId !== selectedVideoSubCategory.subCategoryId
        );
        setLocalVideoSubCategories(updatedSubCategories);
        setVideoSubCategories(updatedSubCategories);
        setIsDeleteModalOpen(false);
        setSelectedVideoSubCategory(null);
      } else {
        console.error("Failed to delete video sub-category");
        setError("Failed to delete video sub-category");
      }
    } catch (error) {
      console.error("Error deleting video sub-category:", error);
      setError("Error deleting video sub-category");
    }
  };

  const openEditModal = (subCategory: VideoSubCategory) => {
    setSelectedVideoSubCategory(subCategory);
    setNewVideoSubCategory({ name: subCategory.name });
    setIsEditModalOpen(true);
  };

  return (
    <>
      <button
        onClick={() => setIsVideoSubCategoryModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4 ml-2"
      >
        View & Edit Sub-Categories
      </button>

      {isVideoSubCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Manage Video Sub-Categories
              </h3>
              <button
                onClick={() => setIsVideoSubCategoryModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg
                  className="w-6 h-6"
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
            {isLoading && <p className="text-gray-600">Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
            >
              Add Sub-Category
            </button>
            <div className="space-y-2">
              {videoSubCategories.map((subCategory) => (
                <div
                  key={subCategory.subCategoryId}
                  className="flex justify-between items-center p-2 border-b"
                >
                  <span
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      onSelectVideoSubCategory(
                        subCategory.subCategoryId.toString()
                      );
                      setIsVideoSubCategoryModalOpen(false);
                    }}
                  >
                    {subCategory.name}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(subCategory)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVideoSubCategory(subCategory);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Sub-Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add New Sub-Category</h3>
            <input
              type="text"
              placeholder="Sub-Category Name"
              value={newVideoSubCategory.name}
              onChange={(e) =>
                setNewVideoSubCategory({
                  ...newVideoSubCategory,
                  name: e.target.value,
                })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVideoSubCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sub-Category Modal */}
      {isEditModalOpen && selectedVideoSubCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Sub-Category</h3>
            <input
              type="text"
              placeholder="Sub-Category Name"
              value={newVideoSubCategory.name}
              onChange={(e) =>
                setNewVideoSubCategory({
                  ...newVideoSubCategory,
                  name: e.target.value,
                })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleEditVideoSubCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Sub-Category Modal */}
      {isDeleteModalOpen && selectedVideoSubCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Delete {selectedVideoSubCategory.name}?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVideoSubCategory}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoSubCategoryManager;
