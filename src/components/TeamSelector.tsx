'use client';

import { useEffect, useState } from 'react';

export default function TeamSelector() {
  const [input, setInput] = useState('');
    const [teamIDs, setTeamIDs] = useState<string[]>([]);
    const [teams, setTeams] = useState<any[]>([]); // Or a specific Team type

    useEffect(() => {
    const stored = localStorage.getItem('favoriteTeamIDs');
    if (stored) {
        const ids: string[] = JSON.parse(stored);
        setTeamIDs(ids);

        Promise.all(ids.map(id =>
        fetch(`/api/team/${id}`).then(res => res.ok ? res.json() : null)
        )).then(results => {
        const validTeams = results.filter(t => t !== null);
        setTeams(validTeams);
        });
    }
    }, []);

    const addTeamID = async () => {
  const trimmed = input.trim();

  if (!trimmed || teamIDs.includes(trimmed)) return;

  try {
    const res = await fetch(`/api/team/${trimmed}`);

    if (!res.ok) {
      alert('Invalid team ID.');
      return;
    }

    const teamData = await res.json(); // Fetch the team info here

    const updatedIDs = [...teamIDs, trimmed];
    const updatedTeams = [...teams, teamData]; // Add to teams array

    setTeamIDs(updatedIDs);
    setTeams(updatedTeams);
    localStorage.setItem('favoriteTeamIDs', JSON.stringify(updatedIDs));
    setInput('');
  } catch (error) {
    console.error('Error validating team ID:', error);
    alert('Could not validate team. Please try again later.');
  }
};

const removeTeamID = (id: string) => {
  const updatedIDs = teamIDs.filter((t) => t !== id);
  const updatedTeams = teams.filter((team) => team._id !== id);

  setTeamIDs(updatedIDs);
  setTeams(updatedTeams);
  localStorage.setItem('favoriteTeamIDs', JSON.stringify(updatedIDs));
};

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-2">Select Your Teams</h1>
      <input
        type="text"
        placeholder="Enter Team ID"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button onClick={addTeamID} className="px-4 py-2 bg-blue-600 text-white rounded mb-4">
        Add Team
      </button>

      <ul className="space-y-2">
        {teams.map((team) => (
          <li key={team._id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <span>{team.Emoji} {team.Location} {team.Name}</span>
            <button
              onClick={() => removeTeamID(team._id)}
              className="text-red-500 hover:underline text-sm"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
