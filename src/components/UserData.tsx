import React, { useEffect, useState } from "react";
import { useUser } from "../context/userContext";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface GradeData {
  total: number;
  male: number;
  female: number;
  unknown: number;
}

interface ApiResponse {
  report: {
    [grade: string]: GradeData;
  };
  totalUsers: number;
}

type SortKey = keyof GradeData;
type SortDirection = "asc" | "desc";

const UserData = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [sortedData, setSortedData] = useState<[string, GradeData][]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  } | null>(null);

  const { userDetails } = useUser();
  const token = userDetails?.accessToken;
  const userId = userDetails?.user.userId;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !userId) return;

      try {
        const res = await fetch(
          "https://dev.yama.maizelab-cloud.com/api/v1/admin/usersReport",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${token}`,
              "x-userid": userId,
            },
          }
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Error fetching data");
        }

        const json: ApiResponse = await res.json();
        setData(json);
        setSortedData(Object.entries(json.report));
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, userId]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    if (!data) return;

    const sorted = [...Object.entries(data.report)].sort((a, b) => {
      const aVal = a[1][key];
      const bVal = b[1][key];
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    });

    setSortedData(sorted);
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key)
      return <ChevronsUpDown className="w-4 h-4 inline ml-1 text-gray-400" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 inline ml-1 text-blue-500" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1 text-blue-500" />
    );
  };

  const exportCSV = () => {
    if (!data) return;

    const headers = ["Grade", "Total", "Male", "Female", "Unknown"];
    const rows = Object.entries(data.report).map(([grade, stats]) => [
      grade,
      stats.total,
      stats.male,
      stats.female,
      stats.unknown,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "user_data_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">User Distribution</h3>
        <button
          onClick={exportCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm text-center">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 border w-[20%]">Grade</th>
              <th
                className="p-3 border cursor-pointer"
                onClick={() => requestSort("total")}
              >
                Total {getSortIcon("total")}
              </th>
              <th
                className="p-3 border cursor-pointer"
                onClick={() => requestSort("male")}
              >
                Male {getSortIcon("male")}
              </th>
              <th
                className="p-3 border cursor-pointer"
                onClick={() => requestSort("female")}
              >
                Female {getSortIcon("female")}
              </th>
              <th
                className="p-3 border cursor-pointer"
                onClick={() => requestSort("unknown")}
              >
                Unknown {getSortIcon("unknown")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 border text-center">
                  <div className="flex justify-center items-center">
                    <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                    <span className="ml-2 text-blue-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="p-4 border text-red-500">
                  {error}
                </td>
              </tr>
            ) : (
              sortedData.map(([grade, stats]) => (
                <tr key={grade} className="hover:bg-gray-50 transition">
                  <td className="p-3 border text-left font-medium">{grade}</td>
                  <td className="p-3 border">{stats.total}</td>
                  <td className="p-3 border">{stats.male}</td>
                  <td className="p-3 border">{stats.female}</td>
                  <td className="p-3 border">{stats.unknown}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="mt-4 text-gray-700 font-medium">
          Total Users: <span className="text-gray-900">{data.totalUsers}</span>
        </div>
      )}
    </div>
  );
};

export default UserData;
