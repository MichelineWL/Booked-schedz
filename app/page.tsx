'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [role, setRole] = useState<string>('user');
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        router.push('/login'); // Redirect to login if there's an error getting the session
      } else if (!session) {
        router.push('/login'); // Redirect to login if no session
      } else {
        // Check role and redirect accordingly
        const { data, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (roleError) {
          console.error("Error fetching role:", roleError);
        } else if (data) {
          setRole(data.role);
          if (data.role === 'admin') {
            router.push('/admin'); // Redirect to admin page if the role is 'admin'
          } else {
            router.push('/user'); // Redirect to user page if the role is 'user'
          }
        }
      }
    };
    
    checkSession();
  }, [router]);

  const updateRole = async (role: string) => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      return;
    }

    const user = session?.user; // Get user from session

    if (user) {
      // Update the role in the users table in Supabase
      const { data, error } = await supabase
        .from('users')
        .upsert(
          { id: user.id, role }, // Ensure the data structure matches your table
          { onConflict: 'id' } // Specify the conflict column as 'id', not an array
        );

      if (error) {
        console.error("Error updating role:", error);
      } else {
        console.log("Role updated to:", role);
        setRole(role); // Update local role state
        // Redirect based on the updated role
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/user');
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Select Role</h1>

        <button
          onClick={() => updateRole('user')}
          className="w-full bg-green-500 text-white py-4 px-6 rounded-lg mb-4 hover:bg-green-600 transition duration-300"
        >
          User
        </button>
        
        <button
          onClick={() => updateRole('admin')}
          className="w-full bg-blue-500 text-white py-4 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Admin
        </button>
        
        <p className="mt-4 text-gray-700">Selected Role: {role}</p>
      </div>
    </div>
  );
}
