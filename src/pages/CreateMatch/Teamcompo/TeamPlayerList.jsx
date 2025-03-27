/* eslint-disable react/prop-types */
import { Button } from "antd";

const TeamPlayerList = ({ teamPlayers, setEditingPlayer, team }) => {
  return (
    <div>
      <h3 style={{ fontSize: "1.4rem", marginBottom: "10px" }}>{team === "team1" ? "Team 1" : "Team 2"} Players:</h3>
      {teamPlayers.map((player, index) => (
        <div key={index} style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>{player.name}</strong> - {player.role} {player.tag && `(${player.tag})`}
          </div>
          <Button
            type="link"
            onClick={() => {
              setEditingPlayer({ team, index }); // Set the editing player
            }}
          >
            Edit
          </Button>
        </div>
      ))}
    </div>
  );
};

export default TeamPlayerList;