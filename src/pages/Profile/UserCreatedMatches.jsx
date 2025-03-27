/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { List, Typography, Button, Spin, Card, Row, Col, message } from "antd";

const { Title, Text } = Typography;

const UserCreatedMatches = ({ matches, loading, onDeleteMatch }) => {
  // Render the scorecard for a match
  const renderScorecard = (teams) => {
    return (
      <div>
        <Title level={4}>Scorecard</Title>
        {teams.map((team, index) => (
          <Card key={index} style={{ marginBottom: "10px" }}>
            <Title level={5}>{team.name}</Title>
            <Row gutter={[16, 16]}>
              {team.players.map((player, playerIndex) => (
                <Col key={playerIndex} span={12}>
                  <Text strong>{player.name}</Text>
                  <Text> (Captain: {player.tag === "captain" ? "Yes" : "No"})</Text>
                  <br />
                  <Text>Runs: {player.status.runs}</Text>
                  <br />
                  <Text>Wickets: {player.status.wickts}</Text>
                </Col>
              ))}
            </Row>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card title="📋 Created Matches" style={{ marginBottom: "20px" }}>
      {loading ? (
        <Spin size="large" />
      ) : matches.length > 0 ? (
        <List
          dataSource={matches}
          renderItem={(match) => (
            <List.Item>
              <List.Item.Meta
                title={<Text strong>{match.matchName}</Text>}
                description={
                  <>
                    <Text>Tournament: {match.tournamentName}</Text>
                    <br />
                    <Text>Status: {match.matchStatus}</Text>
                  </>
                }
              />
              {/* Display scorecard if the match has ended */}
              {match.matchEnd && renderScorecard(match.teams)}

              {/* View Details Button */}
              <Button type="link">View Details</Button>

              {/* Delete Button */}
              <Button
                type="danger"
                onClick={() => onDeleteMatch(match.matchId)}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </Button>
            </List.Item>
          )}
        />
      ) : (
        <Text type="secondary">No matches created yet.</Text>
      )}
    </Card>
  );
};

export default UserCreatedMatches;