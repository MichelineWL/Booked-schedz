'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
// import Navbar from '@/components/Navbar';


type Slot = {
  id: number;
  slot_time: string;
  booked_by: string | null;
};

export default function UserPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Slot[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const fetchSlots = async () => {
    const { data, error } = await supabase.from('slots').select('*');
    if (error) {
      console.error("Error fetching slots:", error);
    } else {
      setSlots(data as Slot[]);
    }
  };

  const bookSlot = async (id: number) => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Error fetching session:", sessionError);
      return;
    }

    const user = sessionData?.session?.user;
    if (!user) {
      alert("You must be logged in to book a slot!");
      return;
    }

    const { error } = await supabase
      .from('slots')
      .update({ booked_by: user.email })
      .eq('id', id)
      .is('booked_by', null);

    if (error) {
      console.error("Error booking slot:", error);
    } else {
      fetchSlots();
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const formatSlotTime = (slotTime: string) => {
    const date = new Date(slotTime);
    return date.toLocaleString();
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        return;
      }

      const user = sessionData?.session?.user;
      if (user) {
        setUserEmail(user.email ?? null);
        setBookedSlots(slots.filter(slot => slot.booked_by === user.email));
      }
    };

    fetchUserData();
  }, [slots]);

  return (
    <div className="bg-white min-h-screen p-6">
      {/* <Navbar/> */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-center mb-6 my-12 text-gray-800">Book a Slot</h1>

        {userEmail ? (
          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-gray-700">Welcome, {userEmail}</p>
          </div>
        ) : (
          <p className="text-center text-lg font-semibold text-red-500">You are not logged in</p>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Slots</h2>
          {slots.filter(slot => !slot.booked_by).length > 0 ? (
            slots.filter(slot => !slot.booked_by).map(slot => (
              <div key={slot.id} className="flex justify-between items-center p-4 mb-4 bg-gray-100 rounded-lg shadow-sm">
                <span className="text-lg text-gray-700">{formatSlotTime(slot.slot_time)}</span>
                <button
                  onClick={() => bookSlot(slot.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
                >
                  Book
                </button>
              </div>
            ))
          ) : (
            <p className="text-lg font-semibold text-gray-500">No available slots.</p>
          )}
        </div>

        {bookedSlots.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800">Your Booked Slots</h2>
            {bookedSlots.map(slot => (
              <div key={slot.id} className="p-4 mb-4 bg-gray-100 rounded-lg shadow-sm">
                <span className="text-lg text-gray-700">{formatSlotTime(slot.slot_time)}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={logout}
          className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
