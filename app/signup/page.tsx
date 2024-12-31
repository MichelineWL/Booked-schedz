'use client';

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import router

export default function SignUpForm() {
    const [data, setData] = useState<{
        email: string;
        password: string;
    }>({
        email: '',
        password: '',
    });

    const router = useRouter(); // Initialize router

    const signup = async () => {
        try {
            let { data: response, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            });

            if (response) {
                console.log("Sign Up Successful:", response);
                router.push('/login'); // Redirect to the login page
            }
            if (error) {
                console.log("Error:", error);
            }
        } catch (error) {
            console.log("Unexpected Error:", error);
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
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Sign Up</h1>
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
                    onClick={signup}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                    Sign Up
                </button>
                <div className="mt-6 text-center">
                    <p className="text-gray-700 text-sm">Already have an account?</p>
                    <Link href="./login">
                        Click here to log in
                    </Link>
                </div>
            </div>
        </div>
    );
}
