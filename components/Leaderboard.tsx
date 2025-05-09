import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { AiOutlineReload } from 'react-icons/ai';

const TABLE = 'supra-game';

export default function Leaderboard() {
  const [loading, setLoading] = useState(false);
  const [board,   setBoard]   = useState<{ [k:string]:number }>({});

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(TABLE)
      .select('player_name, score')
      .order('score', { ascending:false })
      .limit(5);
    setLoading(false);

    if (error) return console.error('[Supabase] fetch error:', error);

    console.table(data);
    const map: { [k:string]:number } = {};
    data?.forEach(r => (map[r.player_name] = r.score));
    setBoard(map);
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  return (
    <div className="leaderboard text-white bg-gray-800 p-2 rounded">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Leaderboard</h2>
        <button onClick={fetchLeaderboard} title="Refresh">
          <AiOutlineReload
            className={loading ? 'animate-spin' : ''}
            size={20}
          />
        </button>
      </div>

      {Object.entries(board).length === 0 && !loading && (
        <p className="italic text-sm">No scores yet</p>
      )}

      {Object.entries(board).map(([name, score]) => (
        <p key={name}>{name}: {score}</p>
      ))}
    </div>
  );
}
