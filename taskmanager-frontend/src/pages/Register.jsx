import { useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('register/', form);
      alert('Registered successfully!');
      navigate('/login');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl mb-4 text-center font-semibold">Register</h2>
        
        <input
          name="username"
          onChange={handleChange}
          value={form.username}
          className="w-full p-2 mb-4 border rounded"
          placeholder="Username"
        />
        <input
          name="email"
          onChange={handleChange}
          value={form.email}
          className="w-full p-2 mb-4 border rounded"
          placeholder="Email"
        />
        <input
          name="password"
          type="password"
          onChange={handleChange}
          value={form.password}
          className="w-full p-2 mb-4 border rounded"
          placeholder="Password"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Register
        </button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">You have an account?</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-2 text-blue-600 hover:underline"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
