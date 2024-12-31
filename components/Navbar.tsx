'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // Ambil session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          return;
        }

        const user = sessionData?.session?.user;
        if (user) {
          // Ambil role berdasarkan user ID
          const { data: roles, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching role:', error);
          } else {
            setRole(roles?.role || null);
          }
        }
      } catch (err) {
        console.error('Unexpected error occurred:', err);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <nav className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="text-lg font-semibold">
          <Link href="/">MyApp</Link>
        </div>
        <div className="flex space-x-6">
          {/* Link Schedules yang tergantung role */}
          {role === 'admin' ? (
            <Link href="/admin" className="hover:text-blue-400 transition">
              Schedules
            </Link>
          ) : (
            <Link href="/user" className="hover:text-blue-400 transition">
              Schedules
            </Link>
          )}
          <Link href="/notes" className="hover:text-blue-400 transition">
            Notes
          </Link>
        </div>
      </div>
    </nav>
  );
}
