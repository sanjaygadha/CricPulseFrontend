/* eslint-disable no-unused-vars */
import { useState } from "react";
import {
  Radio,
  Input,
  Button,
  Card,
  message,
  DatePicker,
  Modal,
  Select,
  TimePicker,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./NewMatch.css";

const { Option } = Select;

const NewMatch = () => {
  const location = useLocation();
  const { team1: initialTeam1, team2: initialTeam2 } = location.state || {};

  const [team1, setTeam1] = useState(initialTeam1 || "");
  const [team2, setTeam2] = useState(initialTeam2 || "");
  const [tossWinner, setTossWinner] = useState(null);
  const [tossDecision, setTossDecision] = useState(null);
  const [overs, setOvers] = useState("");
  const [players, setPlayers] = useState("");
  const [venue, setVenue] = useState("");
  const [matchDate, setMatchDate] = useState(null);
  const [matchTime, setMatchTime] = useState(null);
  const [tournamentName, setTournamentName] = useState("");
  const [team1Logo, setTeam1Logo] = useState(
    "https://img.freepik.com/premium-vector/cricket-player-logo-design-vector-icon-symbol-template-illustration_647432-123.jpg?w=2000"
  );
  const [team2Logo, setTeam2Logo] = useState(
    "https://img.freepik.com/premium-vector/cricket-player-logo-design-vector-icon-symbol-template-illustration_647432-116.jpg?w=2000"
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTeam, setCurrentTeam] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerRole, setPlayerRole] = useState("");
  const [playerTag, setPlayerTag] = useState("player");
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerPhone, setPlayerPhone] = useState("");
  const navigate = useNavigate();

  const handleCreateMatch = async () => {
    if (
      !team1 ||
      !team2 ||
      !tossWinner ||
      !tossDecision ||
      !overs ||
      !venue ||
      !matchDate ||
      !matchTime ||
      !tournamentName
    ) {
      message.error("All fields are required!");
      return;
    }
    if (overs <= 0 || players < 0 || players > 10) {
      message.error(
        "Total overs must be positive and total players must be between 0 and 10!"
      );
      return;
    }
    if (team1 === team2) {
      message.error("Team names must be unique!");
      return;
    }
    if (team1Players.length !== team2Players.length) {
      message.error("Both teams must have an equal number of players!");
      return;
    }

    const battingFirstTeam = tossDecision === "Bat" ? tossWinner : (tossWinner === team1 ? team2 : team1);
  const bowlingFirstTeam = battingFirstTeam === team1 ? team2 : team1;

    const matchData = {
      tournamentName:tournamentName,
      groundName: venue,
      teams: [
        {
          name: team1,
          teamLogo: team1Logo,
          players: team1Players.map((player) => ({
            name: player.name,
            phoneNumber: player.PhoneNumber, // Add phoneNumber
            playerType: player.playerType, // Map role to playerType
            tag: player.tag,
            status: {
              runs: 0,
              sixes: 0,
              fours: 0,
              strikeRate: 0,
              isPlaying: false,
              isOut: false,
              wickts: 0,
              wide: 0,
              overs: 0,
              givenRuns: 0,
            },
          })),
        },
        {
          name: team2,
          teamLogo: team2Logo,
          players: team2Players.map((player) => ({
            name: player.name,
            phoneNumber: player.PhoneNumber, // Add phoneNumber
            playerType: player.playerType, // Map role to playerType
            tag: player.tag,
            status: {
              runs: 0,
              sixes: 0,
              fours: 0,
              strikeRate: 0,
              isPlaying: false,
              isOut: false,
              wickts: 0,
              wide: 0,
              overs: 0,
              givenRuns: 0,
            },
          })),
        },
      ],
      tossWonBy: tossWinner,
      tossDecision: tossDecision.toLowerCase(),
      matchTime: `${matchDate.format("YYYY-MM-DD")}T${matchTime.format(
        "HH:mm:ss"
      )}`,
      totalOvers: parseInt(overs, 10),
      remainingOvers: parseInt(overs, 10),
      totalplayers: team1Players.length,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found. Please log in.");
        return;
      }

      console.log("sending data:",matchData)

      const response = await axios.post(
        "http://localhost:5000/api/matches/creatematch",
        matchData,
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );

      if (response.data.success) {
        message.success("Match created successfully!");
        localStorage.setItem("matchID", response.data.match.matchId);
        localStorage.setItem("createdById", response.data.match.createdBy);
        console.log("matchID : ", response.data.match.matchId);
        console.log("createdById : ", response.data.match.createdBy);
        navigate("/startinnings", { state: { team1: battingFirstTeam, team2: bowlingFirstTeam } });
      } else {
        message.error(response.data.error || "Failed to create match.");
      }
    } catch (error) {
      console.error("Error creating match:", error);
      message.error("Failed to create match. Please try again.");
    }
  };

  const handleAddPlayers = (team) => {
    setCurrentTeam(team);
    setIsModalVisible(true);
  };

  const handleEditPlayer = (team, player) => {
    setCurrentTeam(team);
    setEditingPlayer(player);
    setPlayerName(player.name);
    setPlayerRole(player.role);
    setPlayerTag(player.tag);
    setIsModalVisible(true);
  };

  const handleRemovePlayer = (team, playerToRemove) => {
    if (team === team1) {
      setTeam1Players(team1Players.filter((player) => player !== playerToRemove));
    } else {
      setTeam2Players(team2Players.filter((player) => player !== playerToRemove));
    }
    message.success(`Player ${playerToRemove.name} removed successfully!`);
  };

  const handleModalOk = () => {
    if (!playerName || !playerRole || !playerTag ) {
      message.error("All fields are required!");
      return;
    }

    // Map player role to match backend schema
    const mappedRole = playerRole === "keeper" ? "wicket-keeper" : playerRole;

    const newPlayer = {
      name: playerName,
      phoneNumber: playerPhone, 
      playerType: mappedRole, 
      tag: playerTag,
      status: {
        runs: 0,
        sixes: 0,
        fours: 0,
        strikeRate: 0,
        isPlaying: false,
        isOut: false,
        wickts: 0,
        wide: 0,
        overs: 0,
        givenRuns: 0,
      },
    };

    // Validation logic
    const validatePlayer = (teamPlayers, newPlayer, editingPlayer) => {
      // Check for unique player names
      if (
        teamPlayers.some(
          (p) => p.name === newPlayer.name && p !== editingPlayer
        )
      ) {
        message.error("Player names must be unique within a team!");
        return false;
      }

      // Check for only one captain per team
      if (
        newPlayer.tag === "captain" &&
        teamPlayers.some((p) => p.tag === "captain" && p !== editingPlayer)
      ) {
        message.error("A team can have only one captain!");
        return false;
      }

      // Check for only one keeper per team
      if (
        newPlayer.playerType === "wicket-keeper" &&
        teamPlayers.some(
          (p) => p.playerType === "wicket-keeper" && p !== editingPlayer
        )
      ) {
        message.error("A team can have only one keeper!");
        return false;
      }

      return true;
    };

    // Update team players
    const updateTeamPlayers = (teamPlayers, newPlayer, editingPlayer) => {
      return editingPlayer
        ? teamPlayers.map((p) => (p === editingPlayer ? newPlayer : p))
        : [...teamPlayers, newPlayer];
    };

    // Apply validation and update players for the selected team
    if (currentTeam === team1) {
      if (!validatePlayer(team1Players, newPlayer, editingPlayer)) return;
      setTeam1Players(
        updateTeamPlayers(team1Players, newPlayer, editingPlayer)
      );
    } else {
      if (!validatePlayer(team2Players, newPlayer, editingPlayer)) return;
      setTeam2Players(
        updateTeamPlayers(team2Players, newPlayer, editingPlayer)
      );
    }

    // Reset form fields and close modal
    setPlayerName("");
    setPlayerRole("");
    setPlayerTag("player");
    setPlayerPhone("");
    setEditingPlayer(null);
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingPlayer(null);
    setPlayerName("");
    setPlayerPhone("");
    setPlayerRole("");
    setPlayerTag("player");
  };

  return (
    <div className="new-match-container">
      <Card className="new-match-card">
        <h2 className="title">Create Match</h2>

        {/* Tournament Name Input */}
        <div>
          <label className="label">
            <span className="mark">*</span> Enter Tournament Name:
          </label>
          <Input
            placeholder="Enter tournament name"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value.toUpperCase())}
            className="input-field"
            style={{ marginBottom: "20px" }}
          />
        </div>

        {/* Venue Input */}
        <div>
          <label className="label">
            <span className="mark">*</span> Enter Ground/Stadium Name:
          </label>
          <Input
            placeholder="Enter ground/stadium name"
            value={venue}
            onChange={(e) => setVenue(e.target.value.toUpperCase())}
            className="input-field"
            style={{ marginBottom: "20px" }}
          />
        </div>

        {/* Date and Time Picker */}
        <div>
          <label className="label">
            <span className="mark">*</span> Select Date and Time:
          </label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <DatePicker
              placeholder="Select match date"
              value={matchDate}
              onChange={(date) => setMatchDate(date)}
              style={{ flex: 1 }}
            />
            <TimePicker
              placeholder="Select match time"
              value={matchTime}
              onChange={(time) => setMatchTime(time)}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Team Name and Logo Input Fields */}
        <div className="team-input-wrapper">
          <div>
            <label className="label">
              <span className="mark">*</span> Enter Team 1 Name:
            </label>
            <div className="input-with-button">
              <Input
                placeholder="Enter Team 1 Name"
                value={team1}
                onChange={(e) => setTeam1(e.target.value.toUpperCase())}
                className="input-field"
              />
              <Button
                className="btn"
                type="primary"
                onClick={() => handleAddPlayers(team1)}
                style={{ marginLeft: "10px" }}
              >
                Add Players
              </Button>
            </div>
            <label className="label">Choose Team 1 Logo:</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setTeam1Logo(event.target.result); // Set the logo as a base64 string or URL
                  };
                  reader.readAsDataURL(file);
                } else {
                  setTeam1Logo(
                    "https://img.freepik.com/premium-vector/cricket-player-logo-design-vector-icon-symbol-template-illustration_647432-123.jpg?w=2000"
                  ); // Default logo
                }
              }}
              style={{ marginBottom: "20px" }}
            />
          </div>
          <div>
            <label className="label">
              <span className="mark">*</span> Enter Team 2 Name:
            </label>
            <div className="input-with-button">
              <Input
                placeholder="Enter Team 2 Name"
                value={team2}
                onChange={(e) => setTeam2(e.target.value.toUpperCase())}
                className="input-field"
              />
              <Button
                type="primary"
                className="btn"
                onClick={() => handleAddPlayers(team2)}
                style={{ marginLeft: "10px" }}
              >
                Add Players
              </Button>
            </div>
            <label className="label">Choose Team 2 Logo:</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setTeam2Logo(event.target.result); // Set the logo as a base64 string or URL
                  };
                  reader.readAsDataURL(file);
                } else {
                  setTeam2Logo(
                    "https://img.freepik.com/premium-vector/cricket-player-logo-design-vector-icon-symbol-template-illustration_647432-123.jpg?w=2000"
                  ); // Default logo
                }
              }}
              style={{ marginBottom: "20px" }}
            />
          </div>
        </div>

        {/* Display Players List */}
        <div className="players-list">
          <h3>Team 1 Players:</h3>
          <ul>
            {team1Players.map((player, index) => (
              <li key={index}>
                {player.name}
                {/* Show player role for all players */}
                {` (${player.playerType})`}
                {/* Show tag only for captains and vice-captains */}
                {(player.tag === "captain" || player.tag === "vice-captain") &&
                  ` - ${player.tag}`}
                  <span style={{ display:'flex',gap:"7px" }}>
                <Button
                  type="link"
                  onClick={() => handleEditPlayer(team1, player)}
                  
                  >
                  Edit
                </Button>
               
                <Button
                  type="link"
                  danger
                  onClick={() => handleRemovePlayer(team1, player)}
                  >
                  Remove
                </Button>
                  </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="players-list">
          <h3>Team 2 Players:</h3>
          <ul>
            {team2Players.map((player, index) => (
              <li key={index}>
                {player.name}
                {/* Show player role for all players */}
                {` (${player.playerType})`}
                {/* Show tag only for captains and vice-captains */}
                {(player.tag === "captain" || player.tag === "vice-captain") &&
                  ` - ${player.tag}`}
                   <span style={{ display:'flex',gap:"7px" }}>
                <Button
                  type="link"
                  onClick={() => handleEditPlayer(team2, player)}
                >
                  Edit
                </Button>
                <Button
                  type="link"
                  danger
                  onClick={() => handleRemovePlayer(team2, player)}
                >
                  Remove
                </Button>
                </span>
              </li>
            ))}
          </ul>
        </div>
        {/* Toss Winner Selection */}
        <div className="radio-group">
          <span className="label">
            <span className="mark">*</span> Toss Win:
          </span>
          <Radio.Group
            onChange={(e) => setTossWinner(e.target.value)}
            style={{ marginTop: "10px" }}
          >
            <Radio value={team1}>{team1}</Radio>
            <Radio value={team2}>{team2}</Radio>
          </Radio.Group>
        </div>

        {/* Toss Decision Selection */}
        <div className="radio-group">
          <span className="label">
            <span className="mark">*</span> Choose to:
          </span>
          <Radio.Group
            onChange={(e) => setTossDecision(e.target.value)}
            style={{ marginTop: "10px" }}
          >
            <Radio value="Bat">Bat</Radio>
            <Radio value="Bowl">Bowl</Radio>
          </Radio.Group>
        </div>

        {/* Overs and Players Input */}
        <div className="input-group">
          <div>
            <label className="label">
              <span className="mark">*</span> Total Over(s):
            </label>
            <Input
              type="number"
              value={overs}
              onChange={(e) => {
                const value = e.target.value;
                if (value >= 1) {
                  setOvers(value);
                } else {
                  setOvers("");
                  message.error("Total overs must be at least 1!");
                }
              }}
              min={1}
              className="small-input"
            />
          </div>
          <div>
  <label className="label">
    <span className="mark">*</span> Total Players:
  </label>
  <Input
    type="number"
    value={team1Players.length} // Dynamically display team1 players count
    readOnly // Make the field read-only
    className="small-input"
    style={{ marginBottom: "20px" }}
  />
</div>
        </div>

        {/* Create Button */}
        <Button
          type="primary"
          className="create-button"
          onClick={handleCreateMatch}
        >
          Create
        </Button>
      </Card>

      {/* Add/Edit Players Modal */}
      <Modal
        title={editingPlayer ? "Edit Player" : "Add Player"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <div>
          <label className="label">
            <span className="mark">*</span> Player Name:
          </label>
          <Input
            placeholder="Enter player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input-field"
            style={{ marginBottom: "20px" }}
          />
        </div>

        {/* <div>
          <label className="label">
            <span className="mark">*</span> Phone Number:
          </label>
          <Input
            placeholder="Enter phone number"
            value={playerPhone}
            onChange={(e) => setPlayerPhone(e.target.value)}
            className="input-field"
            style={{ marginBottom: "20px" }}
          />
        </div> */}

        <div>
          <label className="label">
            <span className="mark">*</span> Player Role:
          </label>
          <Select
            placeholder="Select player role"
            value={playerRole}
            onChange={(value) => setPlayerRole(value)}
            style={{ width: "100%", marginBottom: "20px" }}
          >
            <Option value="batsman">Batsman</Option>
            <Option value="bowler">Bowler</Option>
            <Option value="keeper">Keeper</Option>
            <Option value="all-rounder">All-Rounder</Option>
          </Select>
        </div>
        <div>
          <label className="label">
            <span className="mark">*</span> Select Tag:
          </label>
          <Select
            placeholder="Select player tag"
            value={playerTag}
            onChange={(value) => setPlayerTag(value)}
            style={{ width: "100%", marginBottom: "20px" }}
          >
            <Option value="captain">Captain</Option>
            <Option value="vice-captain">Vice-Captain</Option>
            <Option value="player">Player</Option>
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default NewMatch;
