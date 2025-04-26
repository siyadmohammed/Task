import { useEffect, useState } from "react";
import axios from "../api";
import { useNavigate } from "react-router-dom";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [filters, setFilters] = useState({
    title: "",
    status: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        ...(filters.title && { title: filters.title }),
        ...(filters.status && { status: filters.status }),
      });

      const res = await axios.get(`tasks/?${queryParams.toString()}`, authHeaders);
      setTasks(res.data.results);
      setCount(Math.ceil(res.data.count / 10));
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, filters]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        await axios.put(`tasks/${editingId}/`, form, authHeaders);
        setEditingId(null);
      } else {
        await axios.post("tasks/", form, authHeaders);
      }
      setForm({ title: "", description: "", priority: "medium", status: "pending" });
      fetchTasks();
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (task) => {
    setForm(task);
    setEditingId(task.id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`tasks/${id}/`, authHeaders);
    fetchTasks();
  };

  const handleResetFilters = () => {
    setFilters({ title: "", status: "" });
    setPage(1);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Task Manager</h2>
        <button
          onClick={() => {
            setForm({
              title: '',
              description: '',
              priority: 'medium',
              status: 'pending',
            });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          className="p-2 border rounded w-full md:w-1/3"
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
        />
        <select
          className="p-2 border rounded w-full md:w-1/4"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <button
          onClick={handleResetFilters}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Reset Filters
        </button>
      </div>

      {/* Loading Spinner */}
      {isLoading ? (
        <div className="flex justify-center items-center mt-10">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Task List */}
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-gray-100 p-4 rounded shadow">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">{task.title}</h3>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        handleEdit(task);
                        setIsModalOpen(true);
                      }}
                      className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="bg-red-500 px-3 py-1 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {task.description && <p className="text-sm text-gray-700 mt-2">{task.description}</p>}
                <div className="text-sm mt-2">
                  <span className="mr-4">Priority: <strong>{task.priority}</strong></span>
                  <span>Status: <strong>{task.status}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center space-x-2">
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded shadow-lg relative animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4">{editingId ? "Edit Task" : "Create Task"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <div className="flex space-x-4">
                <select name="priority" value={form.priority} onChange={handleChange} className="p-2 border rounded w-1/2">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select name="status" value={form.status} onChange={handleChange} className="p-2 border rounded w-1/2">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  {editingId ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
