'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';  // Your Supabase client instance
import { useRouter } from 'next/navigation';

type Note = {
  id: number;
  title: string;
  content: string;
  sent_to: string;
  created_by: string;
  created_at: string;
};

type User = {
  id: string;
  username: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<{ title: string; content: string }>({
    title: '',
    content: '',
  });
  const [selectedUser, setSelectedUser] = useState<string>(''); // User ID for sending the note
  const [users, setUsers] = useState<User[]>([]); // List of users to display in the dropdown
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Fetch all notes sent by admin
  const fetchNotes = async () => {
    const { data, error } = await supabase.from('notes').select('*');
    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes(data as Note[]);
    }
  };

  // Fetch users with the role 'user'
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .eq('role', 'user'); // Filter by role 'user'

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data as User[]);
    }
  };

  // Add a new note
  const addNote = async () => {
    const user = supabase.auth.user(); // Get the current authenticated user

    if (!newNote.title || !newNote.content || !selectedUser) {
      setError('Please fill out the title, content, and select a user.');
      return;
    }

    try {
      const { error } = await supabase.from('notes').insert([
        {
          title: newNote.title,
          content: newNote.content,
          sent_to: selectedUser,
          created_by: user?.id || 'admin_id', // Use the authenticated user's ID or fallback to a default admin ID
        },
      ]);

      if (error) {
        setError(`Error creating note: ${error.message}`);
      } else {
        setError(null);
        setNewNote({ title: '', content: '' });
        setSelectedUser('');
        fetchNotes(); // Fetch updated notes
        alert('Note created and sent successfully!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('Unexpected error occurred while creating the note.');
    }
  };

  // Handle input changes for new note
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewNote((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchNotes(); // Fetch existing notes
    fetchUsers();  // Fetch users with role 'user'
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Create and Send Notes</h1>

        {/* Admin form to create and send a note */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Create Note</h2>
          {error && <p className="text-red-500">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={newNote.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter note title"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Content</label>
            <textarea
              name="content"
              value={newNote.content}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter note content"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Select User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addNote}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none transition duration-300"
          >
            Send Note
          </button>
        </div>

        {/* Displaying created notes */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Sent Notes</h2>
          {notes.length === 0 ? (
            <p className="text-gray-500">No notes available.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="p-4 border-b border-gray-200 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{note.title}</h3>
                <p className="text-gray-600 mt-2">{note.content}</p>
                <p className="text-gray-500 mt-2">Sent to: {note.sent_to}</p>
                <p className="text-sm text-gray-400">Created on: {new Date(note.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
