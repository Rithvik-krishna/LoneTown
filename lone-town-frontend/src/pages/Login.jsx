import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ setUser }) {
  const [form, setForm] = useState({ name: '', email: '', gender: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  const res = await axios.post('/api/user/login', {
    name: form.name,
    email: form.email,
    gender: form.gender,
  });
  setUser(res.data);
  localStorage.setItem('userId', res.data._id);
  navigate('/onboarding');
};

  return (
    <form onSubmit={handleSubmit} className="max-w-md p-4 mx-auto">
      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" required className="block w-full p-2 mb-2 border" />
      <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" required className="block w-full p-2 mb-2 border" />
      <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="block w-full p-2 mb-4 border">
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="nonbinary">Non-binary</option>
      </select>
      <button className="w-full px-4 py-2 text-white bg-indigo-600 rounded" type="submit">Continue</button>
    </form>
  );
}
