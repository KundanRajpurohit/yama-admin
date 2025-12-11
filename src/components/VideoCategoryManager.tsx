import React, { useState, useEffect } from "react";
import { useUser } from "../context/userContext";

interface VideoCategory {
  categoryId: number;
  name: string;
}

interface VideoSubCategory {
  subCategoryId: number;
  name: string;
}

interface VideoCategorySubCategoryManagerProps {
  onSelectVideoSubCategory: (subCategoryId: string) => void;
}

const VideoCategorySubCategoryManager: React.FC<
  VideoCategorySubCategoryManagerProps
> = ({ onSelectVideoSubCategory }) => {
  const { userDetails } = useUser();
  const token = userDetails?.accessToken;
  const userId = userDetails?.user.userId;
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
  const [videoSubCategories, setVideoSubCategories] = useState<
    VideoSubCategory[]
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);
  const [isAddSubCategoryModalOpen, setIsAddSubCategoryModalOpen] =
    useState(false);
  const [isEditSubCategoryModalOpen, setIsEditSubCategoryModalOpen] =
    useState(false);
  const [isDeleteSubCategoryModalOpen, setIsDeleteSubCategoryModalOpen] =
    useState(false);
  const [selectedVideoCategory, setSelectedVideoCategory] =
    useState<VideoCategory | null>(null);
  const [selectedVideoSubCategory, setSelectedVideoSubCategory] =
    useState<VideoSubCategory | null>(null);
  const [newVideoCategory, setNewVideoCategory] = useState({ name: "" });
  const [newVideoSubCategory, setNewVideoSubCategory] = useState({ name: "" });
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch video categories
  const fetchVideoCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://dev.yama.maizelab-cloud.com/api/v1/videoCategory/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
        }
      );
      const data = await response.json();
      setVideoCategories(data.sports || []);
      if (data.sports && data.sports.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data.sports[0].categoryId.toString());
        setOpenCategoryId(data.sports[0].categoryId);
      }
    } catch (error) {
      console.error("Error fetching video categories:", error);
      setError("Failed to load video categories");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch video subcategories
  const fetchVideoSubCategories = async () => {
    if (!selectedCategoryId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://dev.yama.maizelab-cloud.com/api/v1/videoSubCategory/${selectedCategoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
        }
      );
      const data = await response.json();
      setVideoSubCategories(data.videoSubCategories || []);
    } catch (error) {
      console.error("Error fetching video sub-categories:", error);
      setError("Failed to load video sub-categories");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch video categories on mount
  useEffect(() => {
    fetchVideoCategories();
  }, [token, userId]);

  // Fetch video subcategories when selectedCategoryId changes
  useEffect(() => {
    fetchVideoSubCategories();
  }, [selectedCategoryId, token, userId]);

  const handleAddVideoCategory = async () => {
    try {
      const response = await fetch(
        "https://dev.yama.maizelab-cloud.com/api/v1/videoCategory/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
          body: JSON.stringify({ name: newVideoCategory.name }),
        }
      );
      if (response.ok) {
        setError(null);
        await fetchVideoCategories(); // Refetch categories
        setIsAddCategoryModalOpen(false);
        setNewVideoCategory({ name: "" });
      } else {
        console.error("Failed to add video category");
        setError("Failed to add video category");
      }
    } catch (error) {
      console.error("Error adding video category:", error);
      setError("Error adding video category");
    }
  };

  const handleEditVideoCategory = async () => {
    if (!selectedVideoCategory) return;
    try {
      const response = await fetch(
        "https://dev.yama.maizelab-cloud.com/api/v1/videoCategory/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
          body: JSON.stringify({
            categoryId: selectedVideoCategory.categoryId,
            name: newVideoCategory.name,
          }),
        }
      );
      if (response.ok) {
        setError(null);
        await fetchVideoCategories(); // Refetch categories
        setIsEditCategoryModalOpen(false);
        setNewVideoCategory({ name: "" });
        setSelectedVideoCategory(null);
      } else {
        console.error("Failed to update video category");
        setError("Failed to update video category");
      }
    } catch (error) {
      console.error("Error updating video category:", error);
      setError("Error updating video category");
    }
  };

  const handleDeleteVideoCategory = async () => {
    if (!selectedVideoCategory) return;
    try {
      const response = await fetch(
        `https://dev.yama.maizelab-cloud.com/api/v1/videoCategory/${selectedVideoCategory.categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
        }
      );
      if (response.ok) {
        setError(null);
        await fetchVideoCategories(); // Refetch categories
        setIsDeleteCategoryModalOpen(false);
        setSelectedVideoCategory(null);
        setSelectedCategoryId("");
        setVideoSubCategories([]);
        setOpenCategoryId(null);
      } else {
        console.error("Failed to delete video category");
        setError("Failed to delete video category");
      }
    } catch (error) {
      console.error("Error deleting video category:", error);
      setError("Error deleting video category");
    }
  };

  const handleAddVideoSubCategory = async () => {
    if (!selectedCategoryId) {
      setError("Please select a category first");
      return;
    }
    try {
      const response = await fetch(
        "https://dev.yama.maizelab-cloud.com/api/v1/videoSubCategory/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
          body: JSON.stringify({
            name: newVideoSubCategory.name,
            categoryId: parseInt(selectedCategoryId),
          }),
        }
      );
      if (response.ok) {
        setError(null);
        await fetchVideoSubCategories(); // Refetch subcategories
        setIsAddSubCategoryModalOpen(false);
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
    if (!selectedVideoSubCategory || !selectedCategoryId) return;
    try {
      const response = await fetch(
        "https://dev.yama.maizelab-cloud.com/api/v1/videoSubCategory/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
          body: JSON.stringify({
            subCategoryId: selectedVideoSubCategory.subCategoryId,
            name: newVideoSubCategory.name,
            categoryId: parseInt(selectedCategoryId),
          }),
        }
      );
      if (response.ok) {
        setError(null);
        await fetchVideoSubCategories(); // Refetch subcategories
        setIsEditSubCategoryModalOpen(false);
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
        `https://dev.yama.maizelab-cloud.com/api/v1/videoSubCategory/${selectedVideoSubCategory.subCategoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
        }
      );
      if (response.ok) {
        setError(null);
        await fetchVideoSubCategories(); // Refetch subcategories
        setIsDeleteSubCategoryModalOpen(false);
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

  const openEditCategoryModal = (category: VideoCategory) => {
    setSelectedVideoCategory(category);
    setNewVideoCategory({ name: category.name });
    setIsEditCategoryModalOpen(true);
  };

  const openEditSubCategoryModal = (subCategory: VideoSubCategory) => {
    setSelectedVideoSubCategory(subCategory);
    setNewVideoSubCategory({ name: subCategory.name });
    setIsEditSubCategoryModalOpen(true);
  };

  const toggleCategory = (categoryId: number) => {
    setOpenCategoryId(openCategoryId === categoryId ? null : categoryId);
    setSelectedCategoryId(categoryId.toString());
  };

  return (
    <>
      <button
        onClick={() => setIsManagerModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4 ml-2"
      >
        Add & View Category
      </button>

      {isManagerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl w-full mx-auto max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
          Manage Categories & Sub-Categories
              </h3>
              <button
          onClick={() => setIsManagerModalOpen(false)}
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
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <div className="mb-4">
              <button
          onClick={() => setIsAddCategoryModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
          Add Category
              </button>
            </div>
            <div className="space-y-3">
              {isLoading && videoCategories.length === 0 ? (
          <p className="text-gray-600 text-center">
            Loading categories...
          </p>
              ) : videoCategories.length === 0 ? (
          <p className="text-gray-600 text-center">
            No categories available
          </p>
              ) : (
          videoCategories.map((category) => (
            <div
              key={category.categoryId}
              className="border border-gray-200 rounded-lg shadow-sm"
            >
              <div
                className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 rounded-t-lg"
                onClick={() => toggleCategory(category.categoryId)}
              >
                <span className="font-medium">{category.name}</span>
                <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditCategoryModal(category);
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                setSelectedVideoCategory(category);
                setIsDeleteCategoryModalOpen(true);
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
            <svg
              className={`w-5 h-5 transform transition-transform ${
                openCategoryId === category.categoryId
                  ? "rotate-180"
                  : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
                </div>
              </div>
              {openCategoryId === category.categoryId && (
                <div className="p-3 bg-white rounded-b-lg">
            {isLoading ? (
              <p className="text-gray-600 text-center">
                Loading sub-categories...
              </p>
            ) : videoSubCategories.length === 0 ? (
              <p className="text-gray-600 text-center">
                No sub-categories available
              </p>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h4>Add sub category</h4>
                  <button
              onClick={() =>
                setIsAddSubCategoryModalOpen(true)
              }
              className="bg-green-600 text-white p-1 rounded-full hover:bg-green-700 mb-3"
              title="Add Sub-Category"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
                  </button>
                </div>
                <div className="space-y-2">
                  {videoSubCategories.map((subCategory) => (
              <div
                key={subCategory.subCategoryId}
                className="flex justify-between items-center p-2 border-b border-gray-200"
              >
                <span
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => {
                    onSelectVideoSubCategory(
                subCategory.subCategoryId.toString()
                    );
                    setIsManagerModalOpen(false);
                  }}
                >
                  {subCategory.name}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                openEditSubCategoryModal(subCategory)
                    }
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
                setSelectedVideoSubCategory(
                  subCategory
                );
                setIsDeleteSubCategoryModalOpen(true);
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
              </>
            )}
                </div>
              )}
            </div>
          ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <div className="absolute top-0 left-0 w-full z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full mx-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
            <input
              type="text"
              placeholder="Category Name"
              value={newVideoCategory.name}
              onChange={(e) =>
                setNewVideoCategory({
                  ...newVideoCategory,
                  name: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-200 rounded mb-2"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVideoCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditCategoryModalOpen && selectedVideoCategory && (
        <div className="absolute top-0 left-0 w-full z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full mx-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
            <input
              type="text"
              placeholder="Category Name"
              value={newVideoCategory.name}
              onChange={(e) =>
                setNewVideoCategory({
                  ...newVideoCategory,
                  name: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-200 rounded mb-2"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditCategoryModalOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleEditVideoCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {isDeleteCategoryModalOpen && selectedVideoCategory && (
        <div className="absolute top-0 left-0 w-full z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              Delete {selectedVideoCategory.name}?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteCategoryModalOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVideoCategory}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sub-Category Modal */}
      {isAddSubCategoryModalOpen && (
        <div className="absolute top-0 left-0 w-full z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full mx-auto">
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
              className="w-full p-2 border border-gray-200 rounded mb-2"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddSubCategoryModalOpen(false)}
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
      {isEditSubCategoryModalOpen && selectedVideoSubCategory && (
        <div className="absolute top-0 left-0 w-full z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full mx-auto">
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
              className="w-full p-2 border border-gray-200 rounded mb-2"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditSubCategoryModalOpen(false)}
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
      {isDeleteSubCategoryModalOpen && selectedVideoSubCategory && (
        <div className="absolute top-0 left-0 w-full z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              Delete {selectedVideoSubCategory.name}?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteSubCategoryModalOpen(false)}
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

export default VideoCategorySubCategoryManager;