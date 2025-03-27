import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import MatchCard from './MatchCard';
import './LiveMatches.css';
import { debounce } from 'lodash'; // Import debounce from lodash

const LiveMatches = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch matches from the backend API
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/matches/getmatch');
        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }
        const data = await response.json();
        const reversedData = data.reverse();
        setMatches(reversedData);
        setFilteredMatches(reversedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Debounced search handler
  const handleSearch = debounce((query) => {
    const filtered = matches.filter((match) => {
      const team1Name = match.teams[0]?.name?.toLowerCase() || '';
      const team2Name = match.teams[1]?.name?.toLowerCase() || '';
      const tournamentName = match.tournamentName?.toLowerCase() || '';
      return (
        team1Name.includes(query) ||
        team2Name.includes(query) ||
        tournamentName.includes(query)
      );
    });
    setFilteredMatches(filtered);
  }, 300); // 300ms debounce delay

  // Handle search input change
  const onSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    handleSearch(query);
  };

  // Display loading state
  if (loading) {
    return (
      <div className="loader-container">
        <Spin size="large" />
        <p>Loading matches...</p>
      </div>
    );
  }

  // Display error message
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="live-matches">
      <h1>Live Matches</h1>

      {/* Search Input */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by team name or tournament name..."
          value={searchQuery}
          onChange={onSearchChange}
          className="search-input"
        />
      </div>

      {/* Matches Container */}
      <div className="matches-container">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <MatchCard
              key={match._id} // Use _id as the React key
              match={match} // Pass the match object for static data
              matchId={match.matchId} // Pass matchId for fetching live data
            />
          ))
        ) : (
          <p>No matches found.</p>
        )}
      </div>
    </div>
  );
};

export default LiveMatches;