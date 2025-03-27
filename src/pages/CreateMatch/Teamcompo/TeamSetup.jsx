import { useState } from "react";
import { Card, Row, Col, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import TeamInput from "./TeamInput";
import TeamForm from "./TeamForm";
import TeamPlayerList from "./TeamPlayerList";
import axios from "axios";

const TeamSetup = () => {
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [team1Color, setTeam1Color] = useState(null);
  const [team2Color, setTeam2Color] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const navigate = useNavigate();

  // Check for duplicate team names
  const validateTeamNames = () => {
    if (team1 === team2) {
      message.error("Team 1 and Team 2 cannot have the same name!");
      return false;
    }
    return true;
  };

  // Check for duplicate team colors
  const validateTeamColors = () => {
    if (team1Color === team2Color) {
      message.error("Team 1 and Team 2 cannot have the same color!");
      return false;
    }
    return true;
  };

  const handleProceed = async () => {
    // Validate team names
    if (!team1 || !team2) {
      message.error("Please enter names for both teams!");
      return;
    }

    // Validate team colors
    if (!team1Color || !team2Color) {
      message.error("Please select colors for both teams!");
      return;
    }

    // Validate team names and colors
    if (!validateTeamNames() || !validateTeamColors()) {
      return;
    }

    // Validate player counts
    if (team1Players.length !== team2Players.length) {
      if (team1Players.length > team2Players.length) {
        message.error("Please enter players in Team 2");
        return;
      } else {
        message.error("Please enter players in Team 1");
        return;
      }
    }

    // Validate captains 
    const team1Captain = team1Players.some((player) => player.tag === "Captain");
   
    if (!team1Captain ) {
      message.error("Team 1 must have one Captain ");
      return;
    }

    const team2Captain = team2Players.some((player) => player.tag === "Captain");
    
    if (!team2Captain) {
      message.error("Team 2 must have one Captain ");
      return;
    }

    navigate("/startinnings")

    //Intergarting data base

    try {
      // Send data to the backend
      const response = await axios.post(
        "http://localhost:5000/api/teams",
        {
          team1,
          team2,
          team1Color,
          team2Color,
          team1Players,
          team2Players,
        },
        {
          headers: {
            "Content-Type": "application/json", // Ensure this header is set
          },
        }
      );

      console.log(response)

      if (response.data.success) {
        message.success("Data sucessfully saved in databse");
        navigate("/", {
          state: {
            team1,
            team2,
            team1Color,
            team2Color,
            team1Players,
            team2Players,
          },
        });
      } else {
        message.error(response.data.error);
      }
    } catch (error) {
      // Handle network or server errors
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Server Error:", error.response.data);
        message.error(`Server Error: ${error.response.data.error || "Failed to save teams"}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No Response:", error.request);
        message.error("No response from the server. Please try again.");
      } else {
        // Something happened in setting up the request
        console.error("Request Error:", error.message);
        message.error("Failed to send request. Please try again.");
      }
    }
  };

  return (
    <div className="team-setup-container" style={{ paddingTop: "84px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Card className="team-setup-card" style={{ width: "90%", maxWidth: "1200px", padding: "20px" }}>
        <h2 className="title" style={{ fontSize: "1.8rem", marginBottom: "20px", textAlign: "center" }}>
          Team Setup
        </h2>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <TeamInput
              team={team1}
              setTeam={setTeam1}
              teamColor={team1Color}
              setTeamColor={setTeam1Color}
              teamLabel="Team 1"
              otherTeamColor={team2Color}
            />
          </Col>
          <Col xs={24} md={12}>
            <TeamInput
              team={team2}
              setTeam={setTeam2}
              teamColor={team2Color}
              setTeamColor={setTeam2Color}
              teamLabel="Team 2"
              otherTeamColor={team1Color}
            />
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="Team 1 Players" style={{ marginBottom: "20px" }}>
              <TeamForm
                team="team1"
                teamPlayers={team1Players}
                setTeamPlayers={setTeam1Players}
                editingPlayer={editingPlayer}
                setEditingPlayer={setEditingPlayer}
                teamName={team1}
                teamColor={team1Color}
              />
              <TeamPlayerList
                teamPlayers={team1Players}
                setEditingPlayer={setEditingPlayer}
                team="team1"
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Team 2 Players" style={{ marginBottom: "20px" }}>
              <TeamForm
                team="team2"
                teamPlayers={team2Players}
                setTeamPlayers={setTeam2Players}
                editingPlayer={editingPlayer}
                setEditingPlayer={setEditingPlayer}
                teamName={team2}
                teamColor={team2Color}
              />
              <TeamPlayerList
                teamPlayers={team2Players}
                setEditingPlayer={setEditingPlayer}
                team="team2"
              />
            </Card>
          </Col>
        </Row>

        <Button
          type="primary"
          onClick={handleProceed}
          style={{ width: "100%", fontSize: "1.4rem", padding: "12px 20px" }}
        >
          Proceed to Start Match
        </Button>
      </Card>
    </div>
  );
};

export default TeamSetup;