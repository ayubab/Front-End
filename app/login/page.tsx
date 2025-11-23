'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    // Hard-coded authentication
    const validEmail = 'admin';
    const validPassword = 'admin';

    if (email !== validEmail || password !== validPassword) {
      setError('Email atau password salah');
      return;
    }

    // Authentication successful
    localStorage.setItem('isLoggedIn', 'true');
    router.push('/pilih-lokasi');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-yellow-400 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <div className="text-4xl font-bold text-cyan-500">⚡</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              LOGIN APLIKASI K3L
            </h1>
            <p className="text-gray-600">ULTG YOGYAKARTA</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200 shadow-lg"
            >
              Masuk
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="text-4xl font-bold text-cyan-500">PLN</div>
          </div>
        </div>
      </div>
    </div>
  );
}
