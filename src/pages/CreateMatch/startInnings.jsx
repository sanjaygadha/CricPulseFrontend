
import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { Input, Button, Card, message, Select } from "antd";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { Base_URL } from "../../API/constants";
import axios from "axios"; // For making API requests
import "./StartInnings.css"; // Import the CSS file

const { Option } = Select;

const StartInnings = () => {
  const [strikeBatsman, setStrikeBatsman] = useState("");
  const [nonStrikeBatsman, setNonStrikeBatsman] = useState("");
  const [bowler, setBowler] = useState("");
  const [team1Players, setTeam1Players] = useState([]); // Players for Team 1
  const [team2Players, setTeam2Players] = useState([]); // Players for Team 2
  const [loading, setLoading] = useState(false); // Loading state for API calls
  // const [team1,setTeame1]=useState("")
  // const [team2,setTeame2]=useState("")

  const location = useLocation();
  const navigate = useNavigate();
  const { team1, team2 } = location.state || { team1: "Team A", team2: "Team B" }; // Default values if state is missing

  const MatchId = localStorage.getItem("matchID");

  // Fetch players from the backend
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        // Fetch players for Team 1
        const team1Response = await axios.get(`${Base_URL}/api/matches/selectPlayers/${team1}/${MatchId}`);
        // setTeam1Players(team1Response.data);

        setTeam1Players(Array.isArray(team1Response.data.players) ? team1Response.data.players : []);


        // Fetch players for Team 2
        const team2Response = await axios.get(`${Base_URL}/api/matches/selectPlayers/${team2}/${MatchId}`);
        // setTeam2Players(team2Response.data);
        setTeam2Players(Array.isArray(team2Response.data.players) ? team2Response.data.players : []);

      } catch (error) {
        console.error("Error fetching players:", error);
        message.error("Failed to fetch players. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team1, team2]);


  const handleStartInnings = () => {
    if (!strikeBatsman || !nonStrikeBatsman || !bowler) {
      message.error("All fields are required!");
      return;
    }
  
    if (strikeBatsman === nonStrikeBatsman) {
      message.error("Strike and Non-Strike Batsman must be different!");
      return;
    }

    message.success("Innings started successfully!");

    // Navigate to Scorecard and pass data
    navigate(`/scoreboard/${MatchId}`,{
      state: {
        team1,
        team2,
        strikeBatsman,
        nonStrikeBatsman,
        bowler,
      },
    });
  };

  return (
    <div className="start-innings-container">
      <Card className="innings-card">
        <div className="header">
          <ArrowLeftOutlined onClick={() => navigate(-1)} />
          <h2>Start First Innings</h2>
          <HomeOutlined onClick={() => navigate("/")} />
        </div>

        <h3>Team: {team1}</h3>
        <label >Select Strike Batsman</label>
        <Select
          placeholder="Select Strike Batsman"
          value={strikeBatsman}
          onChange={(value) => setStrikeBatsman(value)}
          className="input-field"
          loading={loading}
        >
          {Array.isArray(team1Players) && team1Players.map((player) => (
            <Option key={player._id} value={player.name}>
              {player.name}
            </Option>
          ))}
        </Select>
        <label>Select Non-Strike Batsman</label>
        <Select
          placeholder="Select Non-Strike Batsman"
          value={nonStrikeBatsman}
          onChange={(value) => setNonStrikeBatsman(value)}
          className="input-field"
          loading={loading}
        >
          {Array.isArray(team1Players) && team1Players.map((player) => (
            <Option key={player._id} value={player.name}>
              {player.name}
            </Option>
          ))}
        </Select>

        <h3>Team: {team2}</h3>
        <label>Select Bowler</label>
        <Select
          placeholder="Select Bowler"
          value={bowler}
          onChange={(value) => setBowler(value)}
          className="input-field"
          loading={loading}
        >
          {Array.isArray(team2Players) && team2Players.map((player) => (
            <Option key={player._id} value={player.name}>
              {player.name}
            </Option>
          ))}
        </Select>

        <Button
          type="primary"
          className="start-button"
          onClick={handleStartInnings}
          loading={loading}
        >
          Start
        </Button>
      </Card>
    </div>
  );
};

export default StartInnings;