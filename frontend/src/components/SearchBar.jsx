
import { useState, useEffect } from "react";

export default function SearchBar({ type, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?type=${type}&query=${query}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
      }
      setLoading(false);
    };

    const delayDebounce = setTimeout(fetchResults, 300); // debounce
    return () => clearTimeout(delayDebounce);
  }, [query, type]);

  return (
    <div className="w-full max-w-md mx-auto mt-20 relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${type}s...`}
        className="w-full p-3 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {loading && <p className="mt-2 text-sm text-gray-500">Loading...</p>}

      {results.length > 0 && (
        <ul className="absolute w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto z-10">
          {results.map((item) => (
            <li
              key={item.entityId}
              onClick={() => onSelect(item.entityId)}
              className="p-3 cursor-pointer hover:bg-blue-100"
            >
              {item.name} ({item.type})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
