/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import { Input, Select } from "antd";

const { Option } = Select;

const TeamInput = ({ team, setTeam, teamColor, setTeamColor, teamLabel, otherTeamColor }) => {
  const teamColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"];

  const handleColorChange = (value) => {
    if (value === otherTeamColor) {
      message.error("This color is already assigned to the other team!");
      return;
    }
    setTeamColor(value);
  };

  return (
    <>
      <Input
        placeholder={`${teamLabel} Name`}
        value={team}
        onChange={(e) => setTeam(e.target.value)}
        style={{ marginBottom: "20px", fontSize: "1.2rem" }}
      />
      <Select
        placeholder={`Select ${teamLabel} Color`}
        value={teamColor}
        onChange={handleColorChange}
        style={{ width: "100%", marginBottom: "20px", fontSize: "1.2rem" }}
      >
        {teamColors.map((color, index) => (
          <Option key={index} value={color}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: color,
                  marginRight: "10px",
                  borderRadius: "50%",
                }}
              />
              {color}
            </div>
          </Option>
        ))}
      </Select>
    </>
  );
};

export default TeamInput;