import React, { useState, useEffect } from "react";
import { useUser } from "../context/userContext";

interface Sport {
  sportId: number;
  name: string;
}

interface SportManagerProps {
  onSelectSport: (sportId: string) => void;
}

const SportManager: React.FC<SportManagerProps> = ({ onSelectSport }) => {
  const { userDetails } = useUser();
  const token = userDetails?.accessToken;
  const userId = userDetails?.user.userId;
  const [sports, setSports] = useState<Sport[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [newSport, setNewSport] = useState({ name: "" });
  const [isSportModalOpen, setIsSportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch sports
  const fetchSports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://dev.yama.maizelab-cloud.com/api/v1/sports",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
        }
      );
      const data = await response.json();
      setSports(data.sports || []);
    } catch (error) {
      console.error("Error fetching sports:", error);
      setError("Failed to load sports");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sports from API
  useEffect(() => {
    fetchSports();
  }, []);

  const handleAddSport = async () => {
    try {
      const response = await fetch(
        "https://dev.yama.maizelab-cloud.com/api/v1/sports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
          body: JSON.stringify({ name: newSport.name }),
        }
      );
      if (response.ok) {
        await fetchSports(); // Refetch sports after adding
        setIsAddModalOpen(false);
        setNewSport({ name: "" });
      } else {
        console.error("Failed to add sport");
        setError("Failed to add sport");
      }
    } catch (error) {
      console.error("Error adding sport:", error);
      setError("Error adding sport");
    }
  };

  const handleEditSport = async () => {
    if (!selectedSport) return;
    try {
      const response = await fetch(
        "https://dev.yama.maizelab-cloud.com/api/v1/sports",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
          body: JSON.stringify({
            sportId: selectedSport.sportId,
            name: newSport.name,
          }),
        }
      );
      if (response.ok) {
        await fetchSports(); // Refetch sports after editing
        setIsEditModalOpen(false);
        setNewSport({ name: "" });
        setSelectedSport(null);
      } else {
        console.error("Failed to update sport");
        setError("Failed to update sport");
      }
    } catch (error) {
      console.error("Error updating sport:", error);
      setError("Error updating sport");
    }
  };

  const handleDeleteSport = async () => {
    if (!selectedSport) return;
    try {
      const response = await fetch(
        `https://dev.yama.maizelab-cloud.com/api/v1/sports/${selectedSport.sportId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
        }
      );
      if (response.ok) {
        setSports(
          sports.filter((sport) => sport.sportId !== selectedSport.sportId)
        );
        setIsDeleteModalOpen(false);
        setSelectedSport(null);
      } else {
        console.error("Failed to delete sport");
        setError("Failed to delete sport");
      }
    } catch (error) {
      console.error("Error deleting sport:", error);
      setError("Error deleting sport");
    }
  };

  const openEditModal = (sport: Sport) => {
    setSelectedSport(sport);
    setNewSport({ name: sport.name });
    setIsEditModalOpen(true);
  };

  return (
    <>
      <button
        onClick={() => setIsSportModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4 ml-2"
      >
        View & Edit Sports
      </button>

      {isSportModalOpen && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Manage Sports</h3>
              <button
                onClick={() => setIsSportModalOpen(false)}
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
              Add Sport
            </button>
            <div className="space-y-2">
              {sports.map((sport) => (
                <div
                  key={sport.sportId}
                  className="flex justify-between items-center p-2 border-b"
                >
                  <span
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      onSelectSport(sport.sportId.toString());
                      setIsSportModalOpen(false);
                    }}
                  >
                    {sport.name}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(sport)}
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
                        setSelectedSport(sport);
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

      {/* Add Sport Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add New Sport</h3>
            <input
              type="text"
              placeholder="Sport Name"
              value={newSport.name}
              onChange={(e) =>
                setNewSport({ ...newSport, name: e.target.value })
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
                onClick={handleAddSport}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sport Modal */}
      {isEditModalOpen && selectedSport && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Sport</h3>
            <input
              type="text"
              placeholder="Sport Name"
              value={newSport.name}
              onChange={(e) =>
                setNewSport({ ...newSport, name: e.target.value })
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
                onClick={handleEditSport}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Sport Modal */}
      {isDeleteModalOpen && selectedSport && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Delete {selectedSport.name}?
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
                onClick={handleDeleteSport}
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

export default SportManager;
