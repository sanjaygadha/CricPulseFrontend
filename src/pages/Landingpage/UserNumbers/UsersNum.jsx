import  { useState, useEffect } from 'react';
import './UserNumbers.css';
import { Base_URL } from '../../../API/constants';

const UserNumbers = () => {
  // State for matches, tournaments, users, and first match date
  const [totalMatches, setTotalMatches] = useState(0);
  const [totalTournaments, setTotalTournaments] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [firstMatchDate, setFirstMatchDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch matches data and calculate stats
  const fetchMatchStats = async () => {
    try {
      const matchResponse = await fetch(`${Base_URL}/api/matches/getmatch`);
      if (!matchResponse.ok) throw new Error('Failed to fetch match data');
      const matchData = await matchResponse.json();

      // Total matches
      setTotalMatches(matchData.length);

      // Total unique tournaments
      const uniqueTournaments = new Set(matchData.map(match => match.tournamentName)).size;
      setTotalTournaments(uniqueTournaments);

      // Sort matches by matchTime and get the first match date
      if (matchData.length > 0) {
        const sortedMatches = matchData.sort((a, b) => new Date(a.matchTime) - new Date(b.matchTime));
        const firstMatch = sortedMatches[0].matchTime;
        setFirstMatchDate(new Date(firstMatch));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch users data
  const fetchUserStats = async () => {
    try {
      const userResponse = await fetch(`${Base_URL}/api/auth/getAllUsers`);
      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      const userData = await userResponse.json();
      setTotalUsers(userData.length); // Assuming API returns an array
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch all data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchMatchStats(), fetchUserStats()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
    return num.toString();
  };

  // Format date for display (e.g., "7th July 2024")
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const suffix = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    return `${day}<sup>${suffix(day)}</sup> ${month} ${year}`;
  };

  return (
    <div className="cric-pulse-numbers">
      <div className="content">
        <h2>CricPulse in Numbers</h2>
        {loading ? (
          <p>Loading stats...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-item">
              <h3 dangerouslySetInnerHTML={{ __html: formatDate(firstMatchDate) }} />
              <p>First Match Scored</p>
            </div>
            <div className="stat-item">
              <h3>{formatNumber(totalMatches)}</h3>
              <p>Matches Scored & Counting</p>
            </div>
            <div className="stat-item">
              <h3>{formatNumber(totalTournaments)}</h3>
              <p>Tournaments Covered</p>
            </div>
            <div className="stat-item">
              <h3>{formatNumber(totalUsers)}</h3>
              <p>Players Registered</p>
            </div>
          </div>
        )}
        <p className="join-text">Join the World’s Largest Cricket Network</p>
        {/* <button className="get-app-button">Get the App</button> */}
      </div>
    </div>
  );
};

export default UserNumbers;