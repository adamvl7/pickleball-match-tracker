"use client"; //Tells Next.js that this file runs in the browser so we can use react hooks.

import { use, useEffect, useState } from "react"; // importing react hooks, useEffect runs code after render, useState stores data that can change

type Match = { //creating a type for Match objects
  id: string; //unique identifier for the match
  playedAt: string; //date the match was played
  opponentName: string; //name of the opponent
  opponentDUPR: number; //opponent's DUPR rating
  yourScore?: number; //your score
  opponentScore?: number; //opponent's score
  result?: "WIN" | "LOSS"; //result of the match, either "WIN" or "LOSS"
  notes?: string; //additional notes about the match
};

export default function Home() { //main component for the home page
  const [matches, setMatches] = useState<Match[]>([]); //state to store the list of matches, initialized as an empty array
  const [form, setForm] = useState({ //state to store form data, initialized with empty/default values
    playedAt: "",
    opponentName: "",
    opponentDUPR: "",
    yourScore: "",
    opponentScore: "",
    outcome: "WIN",
    notes: "",
  });

useEffect(() => {  //Runs once after first render (empty dependency array)
  const raw = localStorage.getItem("matches"); //retrieves the "matches" item from local storage
  if (raw) { //only parse if there is something in local storage
    try {
      setMatches(JSON.parse(raw) as Match[]); //parses the JSON string and updates the matches state
    } catch {
      localStorage.removeItem("matches"); // if parsing fails, remove the corrupted item from local storage
    }
  }
}, []);

useEffect(() => { //this effect depends on matches.
  localStorage.setItem("matches", JSON.stringify(matches)); //saves the current matches state to local storage as a JSON string
}, [matches]);

function deleteMatch(id: string) { //function to delete a match by its ID
  setMatches(prev => prev.filter(m => m.id !== id)); //updates the matches state by filtering out the match with the specified ID
}

function addMatch(e: React.FormEvent) { //function to handle form submission for adding a new match
  e.preventDefault(); //prevents the default form submission behavior

  const opp = form.opponentName.trim(); //trims whitespace from the opponent's name
  const dupr = parseFloat(form.opponentDUPR); //parses the opponent's DUPR rating as a float

  if (!form.playedAt || !opp || Number.isNaN(dupr)) { //validates required fields
    alert("please enter date, opponent name, and opponent DUPR");
    return;
  }

  const m: Match = {
    id: crypto.randomUUID(), //generates a unique ID for the match
    playedAt: form.playedAt, //date the match was played
    opponentName: opp, //opponent's name
    opponentDUPR: dupr,  //opponent's DUPR rating
    yourScore: form.yourScore ? parseInt(form.yourScore) : undefined, //your score, parsed as an integer if provided
    opponentScore: form.opponentScore ? parseInt(form.opponentScore) : undefined, // opponent's score, parsed as an integer if provided
    result: form.outcome === "LOSS" ? "LOSS" : "WIN", //result of the match, defaults to "WIN" if not "LOSS"
    notes: form.notes || undefined, // additional notes, set to undefined if empty
  };

  setMatches(prev => [m, ...prev]); //updates the matches state with the new match

  setForm({ //resets the form state
    playedAt: "",
    opponentName: "",
    opponentDUPR: "",
    yourScore: "",
    opponentScore: "",
    outcome: "WIN",
    notes: "",
  });
}
const total = matches.length; //total number of matches played
const wins = matches.filter(m => m.result === "WIN").length;
const losses = total - wins; //calculates the number of losses
return (
  <main className="max-w-2xl mx-auto p-6">
    <h1 className="text-2xl font-bold">Pickleball Match Tracker</h1>
    <p className="text-sm text-gray-600 mt-1">
      Total: {total} • Wins: {wins} • Losses: {losses}
    </p>

    {/* FORM */}
    <form onSubmit={addMatch} className="grid gap-2 mt-4">
      <input
        type="date"
        value={form.playedAt}
        onChange={(e) => setForm({ ...form, playedAt: e.target.value })}
        className="border p-2 rounded"
      />
      <input
        placeholder="Opponent name"
        value={form.opponentName}
        onChange={(e) => setForm({ ...form, opponentName: e.target.value })}
        className="border p-2 rounded"
      />
      <input
        placeholder="Opponent DUPR (e.g., 3.75)"
        value={form.opponentDUPR}
        onChange={(e) => setForm({ ...form, opponentDUPR: e.target.value })}
        className="border p-2 rounded"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="Your score (optional)"
          value={form.yourScore}
          onChange={(e) => setForm({ ...form, yourScore: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Their score (optional)"
          value={form.opponentScore}
          onChange={(e) => setForm({ ...form, opponentScore: e.target.value })}
          className="border p-2 rounded"
        />
      </div>
      <select
        value={form.outcome}
        onChange={(e) => setForm({ ...form, outcome: e.target.value })}
        className="border p-2 rounded"
      >
        <option>WIN</option>
        <option>LOSS</option>
      </select>
      <textarea
        placeholder="Notes (optional)"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        rows={3}
        className="border p-2 rounded"
      />
      <button className="bg-black text-white rounded p-2 w-fit">Save match</button>
    </form>

    {/* LIST */}
    <ul className="mt-6 space-y-2">
      {matches.map((m) => (
        <li key={m.id} className="border rounded p-3 bg-white">
          <div className="font-medium">{m.opponentName} • {m.result}</div>
          <div className="text-sm text-gray-600">
            {m.playedAt} • DUPR {m.opponentDUPR.toFixed(2)}
          </div>
          {(m.yourScore != null || m.opponentScore != null) && (
            <div className="text-sm">Score: {m.yourScore ?? "-"}–{m.opponentScore ?? "-"}</div>
          )}
          {m.notes && <div className="text-sm italic text-gray-700 mt-1">{m.notes}</div>}
          <button
            onClick={() => deleteMatch(m.id)}
            className="mt-2 border rounded px-3 py-1 text-sm"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  </main>
  );
}