/* eslint-disable react/prop-types */
import { Form, Input, Select, Button, message } from "antd";
import { useEffect } from "react";

const { Option } = Select;

const TeamForm = ({ team, teamPlayers, setTeamPlayers, editingPlayer, setEditingPlayer, teamName, teamColor }) => {
  const [form] = Form.useForm();

  // Populate form fields when editingPlayer changes
  useEffect(() => {
    if (editingPlayer?.team === team) {
      const player = teamPlayers[editingPlayer.index];
      form.setFieldsValue({
        name: player.name,
        phoneNumber: player.phoneNumber, // Add phone number field
        role: player.role,
        tag: player.tag,
      });
    } else {
      form.resetFields(); // Reset the form if not editing
    }
  }, [editingPlayer, team, teamPlayers, form]);

  const handleAddPlayer = (values) => {
    if (teamPlayers.length >= 11) {
      message.error(`A team cannot have more than 11 players!`);
      return;
    }

    if (values.role === "Keeper" && teamPlayers.some((player) => player.role === "Keeper")) {
      message.error(`A team can have only one keeper!`);
      return;
    }

    // Check for duplicate player names
    if (teamPlayers.some((player) => player.name === values.name)) {
      message.error(`Player "${values.name}" already exists in ${team === "team1" ? "Team 1" : "Team 2"}!`);
      return;
    }

    // Check for duplicate phone numbers
    if (teamPlayers.some((player) => player.phoneNumber === values.phoneNumber)) {
      message.error(`Phone number "${values.phoneNumber}" is already in use!`);
      return;
    }

    const newPlayer = {
      name: values.name,
      phoneNumber: values.phoneNumber, // Add phone number to player object
      role: values.role,
      tag: values.tag || null,
    };

    if (newPlayer.tag && teamPlayers.some((player) => player.tag === newPlayer.tag)) {
      message.error(`Tag "${newPlayer.tag}" is already assigned in ${team === "team1" ? "Team 1" : "Team 2"}!`);
      return;
    }

    setTeamPlayers([...teamPlayers, newPlayer]);
    form.resetFields();
  };

  const handleEditPlayer = (values, index) => {
    if (values.role === "Keeper" && teamPlayers.some((player, i) => i !== index && player.role === "Keeper")) {
      message.error(`A team can have only one keeper!`);
      return;
    }

    // Check for duplicate player names (excluding the player being edited)
    if (teamPlayers.some((player, i) => i !== index && player.name === values.name)) {
      message.error(`Player "${values.name}" already exists in ${team === "team1" ? "Team 1" : "Team 2"}!`);
      return;
    }

    // Check for duplicate phone numbers (excluding the player being edited)
    if (teamPlayers.some((player, i) => i !== index && player.phoneNumber === values.phoneNumber)) {
      message.error(`Phone number "${values.phoneNumber}" is already in use!`);
      return;
    }

    const updatedPlayer = {
      name: values.name,
      phoneNumber: values.phoneNumber, // Add phone number to updated player object
      role: values.role,
      tag: values.tag || null,
    };

    if (updatedPlayer.tag && teamPlayers.some((player, i) => i !== index && player.tag === updatedPlayer.tag)) {
      message.error(`Tag "${updatedPlayer.tag}" is already assigned in ${team === "team1" ? "Team 1" : "Team 2"}!`);
      return;
    }

    const updatedPlayers = [...teamPlayers];
    updatedPlayers[index] = updatedPlayer;
    setTeamPlayers(updatedPlayers);
    setEditingPlayer(null);
    form.resetFields();
  };

  return (
    <Form
      form={form}
      onFinish={(values) =>
        editingPlayer?.team === team
          ? handleEditPlayer(values, editingPlayer.index)
          : handleAddPlayer(values)
      }
    >
      <Form.Item
        name="name"
        rules={[{ required: true, message: "Please enter the player's name!" }]}
      >
        <Input placeholder="Player Name" style={{ marginBottom: "10px", fontSize: "1.2rem" }} />
      </Form.Item>

      {/* Add Phone Number Field */}
      <Form.Item
        name="phoneNumber"
        rules={[
          { required: true, message: "Please enter the player's phone number!" },
          {
            pattern: /^\d+$/,
            message: "Phone number must contain only numbers!",
          },
        ]}
      >
        <Input
          type="tel"
          placeholder="Player Phone Number"
          style={{ marginBottom: "10px", fontSize: "1.2rem" }}
        />
      </Form.Item>

      <Form.Item
        name="role"
        rules={[{ required: true, message: "Please select the player's role!" }]}
      >
        <Select placeholder="Select Role" style={{ width: "100%", marginBottom: "10px", fontSize: "1.2rem" }}>
          <Option value="Bowler">Bowler</Option>
          <Option value="Batsman">Batsman</Option>
          <Option value="Keeper">Keeper</Option>
          <Option value="All-Rounder">All-Rounder</Option>
        </Select>
      </Form.Item>

      <Form.Item name="tag">
        <Select placeholder="Select Tag" style={{ width: "100%", marginBottom: "10px", fontSize: "1.2rem" }}>
          <Option value="Captain">Captain</Option>
          <Option value="Vice Captain">Vice Captain</Option>
          <Option value="Experienced (Optinal)">Experienced</Option>
        </Select>
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        style={{ width: "100%", fontSize: "1.2rem", marginBottom: "20px" }}
        disabled={!teamName || !teamColor}
      >
        {editingPlayer?.team === team ? "Update Player" : `Add Player to ${team === "team1" ? "Team 1" : "Team 2"}`}
      </Button>
    </Form>
  );
};

export default TeamForm;