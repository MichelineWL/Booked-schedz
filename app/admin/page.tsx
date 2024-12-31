'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
// import Navbar from '@/components/Navbar';

type Slot = {
  id: number;
  slot_time: string;
  booked_by: string | null;
};

export default function AdminPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [newSlot, setNewSlot] = useState<string>("");
  const [newSlotDate, setNewSlotDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  const fetchSlots = async () => {
    const { data, error } = await supabase.from('slots').select('*').order('slot_time', { ascending: true });
    if (error) {
      console.error("Error fetching slots:", error);
    } else {
      setSlots(data as Slot[]);
    }
  };

  const checkUserRole = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (user) {
        const { data: roles, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching role:", error);
        } else {
          setIsAdmin(roles?.role === 'admin');
        }
      }
    } catch (err) {
      console.error('Unexpected error occurred:', err);
    }
  };

  const addSlot = async () => {
    if (!newSlot || !newSlotDate) {
      setError("Please select both date and time for the slot.");
      return;
    }
  
    // Gabungkan tanggal dan waktu langsung tanpa penyesuaian
    const slotTimeLocal = new Date(`${newSlotDate}T${newSlot}:00`); // Local time
    const slotTimeUTC = slotTimeLocal.toISOString(); // Convert to UTC ISO format
  
    console.log("Slot Time UTC to Save:", slotTimeUTC); // Debug log
  
    try {
      const { error } = await supabase
        .from('slots')
        .insert([{ slot_time: slotTimeUTC, booked_by: null }]);
  
      if (error) {
        setError(`Error adding slot: ${error.message}`);
      } else {
        setError(null);
        alert("Slot added successfully!");
        fetchSlots();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Unexpected error occurred while adding the slot.");
    }
  };
  
  

  const deleteSlot = async (id: number) => {
    const { error } = await supabase.from('slots').delete().eq('id', id);
    if (error) {
      console.error("Error deleting slot:", error);
    } else {
      fetchSlots();
    }
  };

  const updateSlot = async () => {
    if (!editingSlot || !newSlot || !newSlotDate) {
      setError("Please provide a valid time and date to update the slot.");
      return;
    }
    const updatedSlotTime = `${newSlotDate}T${newSlot}`;
    try {
      const { error } = await supabase
        .from('slots')
        .update({ slot_time: updatedSlotTime })
        .eq('id', editingSlot.id);

      if (error) {
        setError(`Error updating slot: ${error.message}`);
      } else {
        setError(null);
        alert("Slot updated successfully!");
        setEditingSlot(null);
        fetchSlots();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Unexpected error occurred while updating the slot.");
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
    checkUserRole();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* <Navbar /> */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Admin - Manage Slots</h1>

        {isAdmin && (
          <div className="mb-8 flex items-center justify-between">
            <div className="flex space-x-4">
              <input
                type="date"
                value={newSlotDate}
                onChange={(e) => setNewSlotDate(e.target.value)}
                className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 w-36"
              />
              <input
                type="time"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 w-36"
              />
            </div>
            <button
              onClick={addSlot}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none transition duration-300"
            >
              Add Slot
            </button>
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}

        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Available Slots</h2>
          {slots.filter(slot => !slot.booked_by).map(slot => (
            <div key={slot.id} className="flex justify-between items-center p-4 border-b border-gray-200">
              <span className="text-lg font-medium text-gray-700">{formatSlotTime(slot.slot_time)}</span>
              {isAdmin && (
                <div className="space-x-2">
                  <button
                    onClick={() => setEditingSlot(slot)}
                    className="text-blue-500 hover:text-blue-600 transition duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteSlot(slot.id)}
                    className="text-red-500 hover:text-red-600 transition duration-300"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {editingSlot && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Edit Slot</h3>
            <div className="flex space-x-4">
              <input
                type="date"
                value={newSlotDate}
                onChange={(e) => setNewSlotDate(e.target.value)}
                className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 w-36"
              />
              <input
                type="time"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 w-36"
              />
            </div>
            <button
              onClick={updateSlot}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none transition duration-300 mt-4"
            >
              Update Slot
            </button>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Booked Slots</h2>
          {slots.filter(slot => slot.booked_by).map(slot => (
            <div key={slot.id} className="p-4 border-b border-gray-200">
              <span className="text-lg font-medium text-gray-700">
                {formatSlotTime(slot.slot_time)} - Booked by <span className="font-semibold">{slot.booked_by || "Unknown Admin"}</span>
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={logout}
          className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 focus:outline-none transition duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
