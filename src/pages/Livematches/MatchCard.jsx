/* eslint-disable no-unused-vars */

/* eslint-disable react/prop-types */
import './MatchCard.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const MatchCard = ({ match, matchId }) => {
  const navigate = useNavigate();
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    tournamentName,
    groundName,
    teams = [],
    tossWonBy,
    tossDecision,
    matchTime,
    totalOvers,
  } = match;

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/matches/${matchId}/scoreboard`);
        if (!response.ok) {
          throw new Error('Failed to fetch live match data');
        }
        const data = await response.json();
        // console.log(data)
        setLiveData(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, [matchId]);

  const matchDate = matchTime
    ? new Date(matchTime).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
    : 'TBD';

  let statusText = 'Yet to Start';
  let battingTeamScore = 'Yet to bat';
  let bowlingTeamScore = 'Yet to bat';
  let isLive = false;
  let resultText = '';
  let matchComplete = false;
  let team1BattedFirst = true; // Flag to determine batting order
  let battingTeamName = teams[0]?.name || 'Team A'; // Default to static data
  let bowlingTeamName = teams[1]?.name || 'Team B';
  let battingTeamLogo = teams[0]?.teamLogo || 'https://via.placeholder.com/40?text=T1';
  let bowlingTeamLogo = teams[1]?.teamLogo || 'https://via.placeholder.com/40?text=T2';

  if (liveData) {
    const currentInnings = liveData.currentInnings || 0;
    matchComplete = liveData.matchComplete || false;
    const { firstInningsData = {}, innings = {}, team1, team2, battingFirst } = liveData;

    // Use live data team names if available, otherwise fall back to static data
    const team1Name = team1 || teams[0]?.name || 'Team A';
    const team2Name = team2 || teams[1]?.name || 'Team B';

    // Determine batting order based on toss and live data
    if (tossWonBy && tossDecision) {
      const tossWinner = tossWonBy === team1Name ? team1Name : team2Name;
      team1BattedFirst = (tossWinner === team1Name && tossDecision === 'bat') || 
                         (tossWinner === team2Name && tossDecision === 'bowl');
    } else {
      team1BattedFirst = battingFirst === team1Name;
    }

    // Assign team names and logos based on batting order
    if (team1BattedFirst) {
      battingTeamName = team1Name;
      bowlingTeamName = team2Name;
      battingTeamLogo = teams.find(t => t.name === team1Name)?.teamLogo || 'https://via.placeholder.com/40?text=T1';
      bowlingTeamLogo = teams.find(t => t.name === team2Name)?.teamLogo || 'https://via.placeholder.com/40?text=T2';
    } else {
      battingTeamName = team2Name;
      bowlingTeamName = team1Name;
      battingTeamLogo = teams.find(t => t.name === team2Name)?.teamLogo || 'https://via.placeholder.com/40?text=T2';
      bowlingTeamLogo = teams.find(t => t.name === team1Name)?.teamLogo || 'https://via.placeholder.com/40?text=T1';
    }

    if (currentInnings === 1 && !matchComplete) {
      // 1st Innings in progress
      statusText = '1st Innings';
      isLive = true;
      battingTeamScore = `${innings.score || 0}/${innings.wickets || 0} (${innings.overs || 0})`;
      bowlingTeamScore = 'Yet to bat';
    } else if (currentInnings === 2 && !matchComplete) {
      // 2nd Innings in progress
      statusText = '2nd Innings';
      isLive = true;
      battingTeamScore = `${firstInningsData.score || 0}/${firstInningsData.wickets || 0} (${firstInningsData.overs || totalOvers})`;
      bowlingTeamScore = `${innings.score || 0}/${innings.wickets || 0} (${innings.overs || 0})`;
    } else if (matchComplete) {
      // Match Completed
      statusText = 'Match Ended';
      isLive = false;
      const firstInningsScore = firstInningsData.score || 0;
      const secondInningsScore = innings.score || 0;
      const secondInningsWickets = innings.wickets || 0;
      const firstInningsOvers = firstInningsData.overs || totalOvers;
      const secondInningsOvers = innings.overs || totalOvers;

      battingTeamScore = `${firstInningsScore}/${firstInningsData.wickets || 0} (${firstInningsOvers})`;
      bowlingTeamScore = `${secondInningsScore}/${secondInningsWickets} (${secondInningsOvers})`;

      // Determine winner
      const target = firstInningsScore + 1;
      if (secondInningsScore >= target && secondInningsWickets < 10) {
        const wicketsRemaining = 10 - secondInningsWickets;
        resultText = `${bowlingTeamName} won by ${wicketsRemaining} wickets`;
      } else if (secondInningsWickets === 10 && secondInningsScore < target) {
        const runsDifference = firstInningsScore - secondInningsScore;
        resultText = `${battingTeamName} won by ${runsDifference} runs`;
      } else if (firstInningsScore > secondInningsScore && secondInningsOvers >= totalOvers) {
        const runsDifference = firstInningsScore - secondInningsScore;
        resultText = `${battingTeamName} won by ${runsDifference} runs`;
      } else if (firstInningsScore === secondInningsScore) {
        resultText = 'Match Tied';
      }
    }
  }

  const handleCardClick = () => {
    navigate(`/scoresCard/${matchId}`, { state: { matchId } });
  };

  if (loading) return <div className="match-card">Loading...</div>;
  if (error) return <div className="match-card">Error: {error}</div>;

  return (
  
    <div className="match-card" onClick={handleCardClick}>
      <div className="match-header">
        <span className="tournament-name">{tournamentName || 'Tournament TBD'}</span>
        <div className="status-indicator">
          {isLive ? (
            <>
              <span className="live-dot"></span>
              <span className="live-text">LIVE</span>
            </>
          ) : matchComplete ? (
            <span className="ended-text">MATCH ENDED</span>
          ) : null}
        </div>
      </div>
      <div className="match-info">
        <span>{groundName || 'Ground TBD'}, {matchDate}, {totalOvers || 'N/A'} Ov</span>
      </div>
      <div className="teams-section">
        <div className="team">
          <img src={battingTeamLogo} alt="Batting Team Logo" className="team-logo" />
          <span className="team-name">{battingTeamName}</span>
          <span className="score">{battingTeamScore}</span>
        </div>
        <div className="team">
          <img src={bowlingTeamLogo} alt="Bowling Team Logo" className="team-logo" />
          <span className="team-name">{bowlingTeamName}</span>
          <span className="score">{bowlingTeamScore}</span>
        </div>
      </div>
      <div className="toss-info">
        {resultText ? (
          <span className="result-text">{resultText}</span>
        ) : (
          <span>{tossWonBy || 'N/A'} won the toss and elected to {tossDecision || 'N/A'}</span>
        )}
      </div>
    </div>
   
  );
};

export default MatchCard;