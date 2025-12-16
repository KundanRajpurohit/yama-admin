import React, { useEffect, useState } from "react";
import { useUser } from "../context/userContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Sport {
  sportId: number;
  name: string;
}

interface Athlete {
  athleteId: number;
  name: string;
  sportId: number;
  profile: string;
  gender: string;
  createdAt: string;
}

interface AthleteManagerProps {
  onSelectAthlete: (athleteId: string) => void;
}

const AthleteManager: React.FC<AthleteManagerProps> = ({ onSelectAthlete }) => {
  const { userDetails } = useUser();
  const token = userDetails?.accessToken;
  const userId = userDetails?.user.userId;
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [newAthlete, setNewAthlete] = useState({
    name: "",
    sportId: "",
    profile: "",
    gender: "",
  });
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch athletes
  const fetchAthletes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/athlete/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
        }
      );
      const data = await response.json();
      setAthletes(data.athletes || []);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      setError("Failed to load athletes");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch athletes and sports from API
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/v1/sports`
        );
        const data = await response.json();
        setSports(data.sports || []);
      } catch (error) {
        console.error("Error fetching sports:", error);
        setError("Failed to load sports");
      }
    };
    fetchAthletes();
    fetchSports();
  }, []);

  const handleAddAthlete = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/athlete/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
          body: JSON.stringify({
            name: newAthlete.name,
            sportId: parseInt(newAthlete.sportId) || 1,
            profile: newAthlete.profile,
            gender: newAthlete.gender,
          }),
        }
      );
      if (response.ok) {
        await fetchAthletes(); // Refetch athletes after adding
        setIsAddModalOpen(false);
        setNewAthlete({ name: "", sportId: "", profile: "", gender: "" });
          setError(null);
      } else {
        console.error("Failed to add athlete");
        setError("Failed to add athlete");
      }
    } catch (error) {
      console.error("Error adding athlete:", error);
      setError("Error adding athlete");
    }
  };

  const handleEditAthlete = async () => {
    if (!selectedAthlete) return;
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/athlete/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
          body: JSON.stringify({
            athleteId: selectedAthlete.athleteId,
            name: newAthlete.name,
            sportId: parseInt(newAthlete.sportId) || selectedAthlete.sportId,
            profile: newAthlete.profile,
            gender: newAthlete.gender,
          }),
        }
      );
      if (response.ok) {
        setAthletes(
          athletes.map((athlete) =>
            athlete.athleteId === selectedAthlete.athleteId
              ? {
                  ...athlete,
                  ...newAthlete,
                  sportId: parseInt(newAthlete.sportId) || athlete.sportId,
                }
              : athlete
          )
        );
        setIsEditModalOpen(false);
        setNewAthlete({ name: "", sportId: "", profile: "", gender: "" });
        setSelectedAthlete(null);
          setError(null);
      } else {
        console.error("Failed to update athlete");
        setError("Failed to update athlete");
      }
    } catch (error) {
      console.error("Error updating athlete:", error);
      setError("Error updating athlete");
    }
  };

  const handleDeleteAthlete = async () => {
    if (!selectedAthlete) return;
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/athlete/${selectedAthlete.athleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-userid": userId ?? "",
          },
        }
      );
      if (response.ok) {
        setAthletes(
          athletes.filter(
            (athlete) => athlete.athleteId !== selectedAthlete.athleteId
          )
        );
        setError(null);
        setIsDeleteModalOpen(false);
        setSelectedAthlete(null);
      } else {
        console.error("Failed to delete athlete");
        setError("Failed to delete athlete");
      }
    } catch (error) {
      console.error("Error deleting athlete:", error);
      setError("Error deleting athlete");
    }
  };

  const openEditModal = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setNewAthlete({
      name: athlete.name,
      sportId: athlete.sportId.toString(),
      profile: athlete.profile,
      gender: athlete.gender,
    });
    setIsEditModalOpen(true);
  };

  return (
    <>
      <button
        onClick={() => setIsAthleteModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        View & Edit Athletes
      </button>

      {isAthleteModalOpen && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Manage Athletes</h3>
              <button
                onClick={() => setIsAthleteModalOpen(false)}
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
              Add Athlete
            </button>
            <div className="space-y-2">
              {athletes.map((athlete) => (
                <div
                  key={athlete.athleteId}
                  className="flex justify-between items-center p-2 border-b"
                >
                  <span
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      onSelectAthlete(athlete.athleteId.toString());
                      setIsAthleteModalOpen(false);
                    }}
                  >
                    {athlete.name}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(athlete)}
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
                        setSelectedAthlete(athlete);
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

      {/* Add Athlete Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 border flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add New Athlete</h3>
            <input
              type="text"
              placeholder="Name"
              value={newAthlete.name}
              onChange={(e) =>
                setNewAthlete({ ...newAthlete, name: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <select
              value={newAthlete.sportId}
              onChange={(e) =>
                setNewAthlete({ ...newAthlete, sportId: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            >
              <option value="">Select Sport</option>
              {sports.map((sport) => (
                <option key={sport.sportId} value={sport.sportId}>
                  {sport.name}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Profile"
              value={newAthlete.profile}
              onChange={(e) =>
                setNewAthlete({ ...newAthlete, profile: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
              rows={3}
            />
            <select
              value={newAthlete.gender}
              onChange={(e) =>
                setNewAthlete({ ...newAthlete, gender: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAthlete}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Athlete Modal */}
      {isEditModalOpen && selectedAthlete && (
        <div className="fixed inset-0 border-b-black flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Athlete</h3>
            <input
              type="text"
              placeholder="Name"
              value={newAthlete.name}
              onChange={(e) =>
                setNewAthlete({ ...newAthlete, name: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <select
              value={newAthlete.sportId}
              onChange={(e) =>
                setNewAthlete({ ...newAthlete, sportId: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            >
              <option value="">Select Sport</option>
              {sports.map((sport) => (
                <option key={sport.sportId} value={sport.sportId}>
                  {sport.name}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Profile"
              value={newAthlete.profile}
              onChange={(e) =>
                setNewAthlete({ ...newAthlete, profile: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
              rows={3}
            />
            <select
              value={newAthlete.gender}
              onChange={(e) =>
                setNewAthlete({ ...newAthlete, gender: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleEditAthlete}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Athlete Modal */}
      {isDeleteModalOpen && selectedAthlete && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Delete {selectedAthlete.name}?
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
                onClick={handleDeleteAthlete}
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

export default AthleteManager;
