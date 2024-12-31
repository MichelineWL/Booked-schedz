'use client';

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [data, setData] = useState<{
        email: string;
        password: string;
    }>({
        email: '',
        password: '',
    });

    const router = useRouter(); // Initialize the useRouter hook

    const login = async () => {
        try {
            // Akses data setelah inisialisasi
            const { email, password } = data;

            let { data: response, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (response) {
                console.log("Login Successful:", response);
                router.refresh();
            }
            if (error) {
                console.log("Error:", error.message);
            }
        } catch (error) {
            console.error("Unexpected Error:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Login</h1>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                    <input
                        type="text"
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your password"
                    />
                </div>
                <button
                    onClick={login}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                    Log In
                </button>
                <div className="mt-4 text-center">
                    <span className="text-sm text-gray-600">Don't have an account?</span>
                    <button
                        onClick={() => router.push('/signup')}
                        className="ml-2 text-blue-500 hover:text-blue-600"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
}
