import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Layout,
  Button,
  Row,
  Col,
  Typography,
  Table,
  message,
  Spin,
} from "antd";
import { ShareAltOutlined } from "@ant-design/icons";
import "./scoresCard.css";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const ScoresCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchData, setMatchData] = useState(null);

  const location = useLocation();
  const { matchId } = location.state || {};

  const fetchScorecardData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/matches/${matchId}/scoreboard`
      );
      const { data } = response.data;
      setMatchData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      message.error("Failed to fetch scorecard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      fetchScorecardData();
      const intervalId = setInterval(() => {
        fetchScorecardData();
      }, 2000);
      return () => clearInterval(intervalId);
    }
  }, [matchId]);

  const handleShare = () => {
    if (!matchData) return;

    const { team1, team2, firstInningsData, innings, matchComplete } = matchData;
    const matchSummary = `
🏏 CricPulse Match Summary 🏏
🏟 Match ID: ${matchId}
👥 Teams: ${team1} vs ${team2}
✅ ${team1} - ${firstInningsData.score}/${firstInningsData.wickets}
✅ ${team2} - ${innings.score}/${innings.wickets}
📢 Status: ${matchComplete ? "Match Completed" : "In Progress"}
    `;

    if (navigator.share) {
      navigator
        .share({
          title: "CricPulse Match Summary",
          text: matchSummary,
          url: window.location.href,
        })
        .catch((error) => message.error("Error sharing score: " + error));
    } else {
      navigator.clipboard
        .writeText(matchSummary)
        .catch((error) => message.error("Error copying score: " + error));
    }
  };

  if (loading) return <Spin size="large" />;
  if (error) return <Text type="danger">{error}</Text>;
  if (!matchData) return <Text>No scorecard data available</Text>;

  const { firstInningsData, innings, team1, team2, totalOvers, matchComplete, currentInnings } = matchData;

  const firstInningsBatsmen = firstInningsData.batsmen.map((batsman, index) => ({
    key: `${index + 1}`,
    name: batsman.name,
    runs: batsman.runs,
    balls: batsman.balls,
    fours: batsman.fours,
    sixes: batsman.sixes,
    strikeRate: batsman.strikeRate.toFixed(2),
    status: batsman.isOut ? "Out" : "Not Out",
  }));

  const firstInningsBowlers = firstInningsData.bowlers.map((bowler, index) => ({
    key: `${index + 1}`,
    name: bowler.name,
    overs: bowler.overs,
    maidens: bowler.maidens,
    runs: bowler.runs,
    wickets: bowler.wickets,
    economy: (bowler.runs / (bowler.overs || 1)).toFixed(2),
  }));

  const secondInningsBatsmen = innings.batsmen.map((batsman, index) => ({
    key: `${index + 1}`,
    name: batsman.name,
    runs: batsman.runs,
    balls: batsman.balls,
    fours: batsman.fours,
    sixes: batsman.sixes,
    strikeRate: batsman.strikeRate.toFixed(2),
    status: batsman.isOut ? "Out" : "Not Out",
  }));

  const secondInningsBowlers = innings.bowlers.map((bowler, index) => ({
    key: `${index + 1}`,
    name: bowler.name,
    overs: bowler.overs,
    maidens: bowler.maidens,
    runs: bowler.runs,
    wickets: bowler.wickets,
    economy: (bowler.runs / (bowler.overs || 1)).toFixed(2),
  }));

  const target = firstInningsData.score + 1;
  const runsRequired = target - innings.score;
  const ballsPlayed = innings.batsmen.reduce((sum, b) => sum + b.balls, 0);
  const ballsRemaining = totalOvers * 6 - ballsPlayed;
  const requiredRunRate = ballsRemaining > 0 ? (runsRequired / (ballsRemaining / 6)).toFixed(2) : 0;

  let matchResult = "";
  if (matchComplete) {
    if (firstInningsData.score === innings.score) {
      matchResult = "Match Tied";
    } else if (firstInningsData.score > innings.score) {
      const runsMargin = firstInningsData.score - innings.score;
      matchResult = `${team1} Won by ${runsMargin} run${runsMargin !== 1 ? "s" : ""}`;
    } else {
      const wicketsRemaining = 10 - innings.wickets;
      matchResult = `${team2} Won by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? "s" : ""}`;
    }
  }

  return (
    <Layout className="cricket-app">
      <Header className="app-header">
        <Title level={4} className="title-text">
          {team1} vs {team2} - Match Scorecard
        </Title>
      </Header>

      <Content style={{ padding: "0 16px" }}>
        {/* Flex container for match summary and share button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0" }}>
          <Row align="middle">
            <Col>
              <Text className="score-display">
                Total Overs: {totalOvers} | Status:{" "}
                {matchComplete ? "Match Ended" : "In Progress"}
                {matchComplete && ` | Result: ${matchResult}`}
              </Text>
            </Col>
          </Row>

          {/* Share Button */}
          <div className="share-button-container">
            <Button
              className="share-btn"
              style={{ background: "#1e295e", color: "white", fontSize: "20px" }}
              onClick={handleShare}
              icon={<ShareAltOutlined />}
            />
          </div>
        </div>

        {(currentInnings === 1 || currentInnings === 2) && (
          <div className="scorecard-container">
            <Title level={4} className="scorecard-title">
              <span>{team1} 1st Innings</span>{" "}
              <span className="span-score">
                {firstInningsData.score}/{firstInningsData.wickets}
              </span>
            </Title>
            <Title level={5}>Batting</Title>
            <Table
              columns={[
                { title: "Batsman", dataIndex: "name", key: "name" },
                { title: "Runs", dataIndex: "runs", key: "runs" },
                { title: "Balls", dataIndex: "balls", key: "balls" },
                { title: "4s", dataIndex: "fours", key: "fours" },
                { title: "6s", dataIndex: "sixes", key: "sixes" },
                { title: "SR", dataIndex: "strikeRate", key: "strikeRate" },
                { title: "Status", dataIndex: "status", key: "status" },
              ]}
              dataSource={firstInningsBatsmen}
              pagination={false}
            />
            <Title level={5}>Bowling</Title>
            <Table
              columns={[
                { title: "Bowler", dataIndex: "name", key: "name" },
                { title: "O", dataIndex: "overs", key: "overs" },
                { title: "M", dataIndex: "maidens", key: "maidens" },
                { title: "R", dataIndex: "runs", key: "runs" },
                { title: "W", dataIndex: "wickets", key: "wickets" },
                { title: "Econ", dataIndex: "economy", key: "economy" },
              ]}
              dataSource={firstInningsBowlers}
              pagination={false}
            />
          </div>
        )}

        {currentInnings === 2 && (
          <div className="scorecard-container">
            <Title level={4} className="scorecard-title">
              <span>{team2} 2nd Innings </span>{" "}
              <span className="span-score">
                {innings.score}/{innings.wickets}
              </span>
            </Title>
            <Text strong>Target: {target} runs</Text>
            <br />
            {!matchComplete && (
              <Text>
                {runsRequired > 0
                  ? `Need ${runsRequired} runs in ${ballsRemaining} balls (RRR: ${requiredRunRate})`
                  : "Target achieved!"}
              </Text>
            )}
            <Title level={5}>Batting</Title>
            <Table
              columns={[
                { title: "Batsman", dataIndex: "name", key: "name" },
                { title: "Runs", dataIndex: "runs", key: "runs" },
                { title: "Balls", dataIndex: "balls", key: "balls" },
                { title: "4s", dataIndex: "fours", key: "fours" },
                { title: "6s", dataIndex: "sixes", key: "sixes" },
                { title: "SR", dataIndex: "strikeRate", key: "strikeRate" },
                { title: "Status", dataIndex: "status", key: "status" },
              ]}
              dataSource={secondInningsBatsmen}
              pagination={false}
            />
            <Title level={5}>Bowling</Title>
            <Table
              columns={[
                { title: "Bowler", dataIndex: "name", key: "name" },
                { title: "O", dataIndex: "overs", key: "overs" },
                { title: "M", dataIndex: "maidens", key: "maidens" },
                { title: "R", dataIndex: "runs", key: "runs" },
                { title: "W", dataIndex: "wickets", key: "wickets" },
                { title: "Econ", dataIndex: "economy", key: "economy" },
              ]}
              dataSource={secondInningsBowlers}
              pagination={false}
            />
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default ScoresCard;