/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Layout,
  Button,
  Row,
  Col,
  Typography,
  Table,
  Checkbox,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Spin,
} from "antd";
import {
  HomeOutlined,
  ArrowLeftOutlined,
  SwapOutlined,
  RedoOutlined,
  PoweroffOutlined,
  ShareAltOutlined
} from "@ant-design/icons";
import "./CricketScorecard.css";
import React from "react";
import { constant } from "lodash";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const Scoreboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { team1, team2, strikeBatsman, nonStrikeBatsman, bowler } = location.state || {};
  const MatchId = localStorage.getItem("matchID");

  const [currentInnings, setCurrentInnings] = useState(1);
  const [firstInningsData, setFirstInningsData] = useState(null);
  const [secondInningsData, setSecondInningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalOvers, setTotalOvers] = useState(0);
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);
  const [matchComplete, setMatchComplete] = useState(false);
  const [isBowlerModalVisible, setIsBowlerModalVisible] = useState(false);
  const [isStartSecondInningsModalVisible, setIsStartSecondInningsModalVisible] = useState(false);
  const [isSecondInningsSetupModalVisible, setIsSecondInningsSetupModalVisible] = useState(false);
  const [matchDetails, setMatchDetails] = useState({
    matchName: "Match 1",
    team1: "Team A",
    team2: "Team B",
  });

  const [innings, setInnings] = useState({
    score: 0,
    wickets: 0,
    overs: 0.0,
    extras: 0,
    wides: 0,
    noBalls: 0,
    byes: 0,
    legByes: 0,
    currentOverBalls: [],
  });

  const [isWicketModalVisible, setIsWicketModalVisible] = useState(false);
  const [isEndInningsModalVisible, setIsEndInningsModalVisible] = useState(false);
  const [isScorecardModalVisible, setIsScorecardModalVisible] = useState(false);
  const [isMatchResultModalVisible, setIsMatchResultModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [secondInningsForm] = Form.useForm();

  const [isWide, setIsWide] = useState(false);
  const [isNoBall, setIsNoBall] = useState(false);
  const [isByes, setIsByes] = useState(false);
  const [isLegByes, setIsLegByes] = useState(false);
  const [isWicket, setIsWicket] = useState(false);

  const [batsmen, setBatsmen] = useState([]);
  const [bowlers, setBowlers] = useState([]);
  const [currentBowler, setCurrentBowler] = useState(0);
  const [outBatsmen, setOutBatsmen] = useState([]);
  const [availableBatsmen, setAvailableBatsmen] = useState([]);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [ballHistory, setBallHistory] = useState([]);

  const saveScoreboardData = async () => {
    try {
      // Current innings data
      const currentInningsData = {
        score: innings.score,
        wickets: innings.wickets,
        overs: innings.overs,
        extras: {
          total: innings.extras,
          wides: innings.wides,
          noBalls: innings.noBalls,
          byes: innings.byes,
          legByes: innings.legByes,
        },
        batsmen: [...batsmen, ...outBatsmen].map((b) => ({
          key: b.key,
          name: b.name,
          runs: b.runs,
          balls: b.balls,
          fours: b.fours,
          sixes: b.sixes,
          strikeRate: b.strikeRate,
          isOut: b.status === "Out" || b.status === "Retired Hurt", // Map status to isOut
        })),
        bowlers: bowlers.filter((b) => b.balls > 0).map((b) => ({
          key: b.key,
          name: b.name,
          overs: Math.floor(b.balls / 6) + (b.balls % 6) / 10, // Convert balls to overs
          maidens: b.maidenOvers,
          runs: b.runs,
          wickets: b.wickets,
          economy: b.balls > 0 ? (b.runs / (b.balls / 6)).toFixed(2) : 0,
        })),
      };
  
      

      // Structure the data to send to the backend
      const scoreboardData = {
        matchId: MatchId,
        currentInnings: currentInnings,
        team1: team1,
        team2: team2,
        totalOvers: totalOvers,
        innings: currentInningsData, // Current innings data
        matchComplete: matchComplete,
        // firstInningsData: firstInningsData, // Will be null until first innings ends
        ...(currentInnings === 1 && innings.overs >= totalOvers || innings.wickets >= 10
          ? { firstInningsData: currentInningsData }
          : {}),
        ...(currentInnings === 2 && (innings.score >= targetRuns || innings.wickets >= 10 || innings.overs >= totalOvers)
          ? { secondInningsData: currentInningsData }
          : {}),
      };
  
      // Send the data to the backend
      console.log("Sending scoreboard data:", scoreboardData); // Debug log
      const response = await axios.put(`http://localhost:5000/api/matches/${MatchId}/scoreboard`, scoreboardData);
      console.log("Response:", response.data); // Debug log
      // message.success("Scoreboard data saved successfully!");
      // Update local state based on response
      if (currentInnings === 1 && (innings.overs >= totalOvers || innings.wickets >= 10)) {
        setFirstInningsData(response.data.firstInningsData);
      } else if (currentInnings === 2 && (innings.score >= targetRuns || innings.wickets >= 10 || innings.overs >= totalOvers)) {
        setSecondInningsData(response.data.secondInningsData);
      }
    } catch (err) {
      console.error("Error saving scoreboard:", err.response || err.message);
      message.error("Failed to save scoreboard data: " + err.message);
    }
  };

  const resetForNewInnings = (battingTeam, bowlingTeam, strikeBatsmanName, nonStrikeBatsmanName, bowlerKey) => {
    setInnings({
      score: 0,
      wickets: 0,
      overs: 0.0,
      extras: 0,
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      currentOverBalls: [],
    });
    setCurrentOver(0);
    setCurrentBall(0);
    setMatchComplete(false);
    setBallHistory([]);
    setOutBatsmen([]);
    setIsWide(false);
    setIsNoBall(false);
    setIsByes(false);
    setIsLegByes(false);
    setIsWicket(false);

    const battingPlayers = battingTeam === team1 ? team1Players : team2Players;
    const bowlingPlayers = bowlingTeam === team1 ? team1Players : team2Players;

    const selectedBatsmen = [
      {
        key: battingPlayers.find((p) => p.name === strikeBatsmanName)?.key || "1",
        name: strikeBatsmanName || battingPlayers[0]?.name || "Batsman 1",
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        onStrike: true,
        status: "Not Out",
        outType: "",
      },
      {
        key: battingPlayers.find((p) => p.name === nonStrikeBatsmanName)?.key || "2",
        name: nonStrikeBatsmanName || battingPlayers[1]?.name || "Batsman 2",
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        onStrike: false,
        status: "Not Out",
        outType: "",
      },
    ];

    setBatsmen(selectedBatsmen);
    setBowlers(
      bowlingPlayers.map((player, index) => ({
        key: `${index + 1}`,
        name: player.name,
        overs: 0.0,
        balls: 0,
        wickets: 0,
        runs: 0,
        economy: 0,
        maidenOvers: 0,
        currentOverRuns: 0,
      }))
    );

    const filteredAvailableBatsmen = battingPlayers.filter(
      (player) => player.name !== strikeBatsmanName && player.name !== nonStrikeBatsmanName
    );
    setAvailableBatsmen(filteredAvailableBatsmen);
    setCurrentBowler(bowlers.findIndex((b) => b.key === bowlerKey) || 0);
    // setLoading(false);
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const team1Response = await axios.get(
          `http://localhost:5000/api/matches/selectPlayers/${team1}/${MatchId}`
        );
        const fetchedTeam1Players = team1Response.data.players.map((player, index) => ({
          key: `${index + 1}`,
          name: player.name,
          tag: player.tag || player.role || "",
        }));

        const team2Response = await axios.get(
          `http://localhost:5000/api/matches/selectPlayers/${team2}/${MatchId}`
        );
        const fetchedTeam2Players = team2Response.data.players.map((player, index) => ({
          key: `${index + 1}`,
          name: player.name,
          tag: player.tag || player.role || "",
        }));

        const response = await axios.get(`http://localhost:5000/api/matches/${MatchId}`);
        const { totalOvers } = response.data.data;

        setTeam1Players(fetchedTeam1Players);
        setTeam2Players(fetchedTeam2Players);
        setTotalOvers(totalOvers);

        if (currentInnings === 1 && !firstInningsData) {
          const selectedBatsmen = [
            {
              key: "1",
              name: strikeBatsman || fetchedTeam1Players[0]?.name || "Batsman 1",
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              strikeRate: 0,
              onStrike: true,
              status: "Not Out",
              outType: "",
            },
            {
              key: "2",
              name: nonStrikeBatsman || fetchedTeam1Players[1]?.name || "Batsman 2",
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              strikeRate: 0,
              onStrike: false,
              status: "Not Out",
              outType: "",
            },
          ];
          setBatsmen(selectedBatsmen);
          setBowlers(
            fetchedTeam2Players.map((player, index) => ({
              key: `${index + 1}`,
              name: player.name,
              overs: 0.0,
              balls: 0,
              wickets: 0,
              runs: 0,
              economy: 0,
              maidenOvers: 0,
              currentOverRuns: 0,
            }))
          );
          const filteredAvailableBatsmen = fetchedTeam1Players.filter(
            (player) => player.name !== strikeBatsman && player.name !== nonStrikeBatsman
          );
          setAvailableBatsmen(filteredAvailableBatsmen);
        }
      } catch (err) {
        setError(err.message);
        message.error("Failed to fetch players");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [team1, team2, MatchId, strikeBatsman, nonStrikeBatsman, bowler]);

  useEffect(() => {
    const fullOvers = Math.floor(innings.overs);
    const balls = Math.round((innings.overs - fullOvers) * 10);
    setCurrentOver(fullOvers);
    setCurrentBall(balls);
  }, [innings.overs]);

  const targetRuns = firstInningsData ? firstInningsData.score + 1 : 0;
  const remainingRuns = currentInnings === 2 ? Math.max(0, targetRuns - innings.score) : 0;
  const remainingBalls = totalOvers * 6 - (currentOver * 6 + currentBall);
  const requiredRunRate =
    currentInnings === 2 && remainingBalls > 0 && !matchComplete
      ? (remainingRuns / (remainingBalls / 6)).toFixed(2)
      : "0.00";

  const updateStrikeRate = (batsman) => {
    if (batsman.balls === 0) return 0;
    return (batsman.runs / batsman.balls) * 100;
  };

  const handleScoreClick = (score) => {
    if (matchComplete) {
      message.info("Match is completed. Please use undo to continue or start a new match.");
      return;
    }

    if (isBowlerModalVisible) {
      message.warning("Please select a new bowler to continue the match!");
      return;
    }

    saveToHistory();

    let newBalls = currentBall;
    let newOvers = currentOver;
    let overComplete = false;

    if (!isWide && !isNoBall) {
      newBalls += 1;
      if (newBalls === 6) {
        newBalls = 0;
        newOvers += 1;
        overComplete = true;
      }
    }

    const newInningsOvers = isWide || isNoBall ? innings.overs : newOvers + newBalls / 10;

    const updatedBatsmen = batsmen.map((b, index) =>
      b.onStrike
        ? {
            ...b,
            runs: isWide || isLegByes || isByes ? b.runs : b.runs + score,
            balls: isWide ? b.balls : b.balls + 1,
            fours: score === 4 && !isByes && !isLegByes && !isWide ? b.fours + 1 : b.fours,
            sixes: score === 6 && !isByes && !isLegByes && !isWide ? b.sixes + 1 : b.sixes,
            strikeRate: updateStrikeRate({
              ...b,
              runs: isWide || isLegByes || isByes ? b.runs : b.runs + score,
              balls: isWide ? b.balls : b.balls + 1,
            }),
          }
        : b
    );

    const updatedBowlers = bowlers.map((b, index) =>
      index === currentBowler
        ? {
            ...b,
            balls: isWide || isNoBall ? b.balls : b.balls + 1,
            runs:
              isWide || isNoBall
                ? b.runs + score + 1
                : isByes || isLegByes
                ? b.runs + score
                : b.runs + score,
            currentOverRuns:
              isWide || isNoBall
                ? b.currentOverRuns + score + 1
                : isByes || isLegByes
                ? b.currentOverRuns + score
                : b.currentOverRuns + score,
            maidenOvers: overComplete && b.currentOverRuns === 0 ? b.maidenOvers + 1 : b.maidenOvers,
          }
        : b
    );

    if (overComplete) {
      updatedBowlers[currentBowler].currentOverRuns = 0;
    }

    let newInningsScore = innings.score;
    let newExtras = innings.extras;
    let newWides = innings.wides;
    let newNoBalls = innings.noBalls;
    let newByes = innings.byes;
    let newLegByes = innings.legByes;
    let ballNotation = score.toString();

    if (isWide) {
      newExtras += score + 1;
      newWides += score + 1;
      newInningsScore += score + 1;
      ballNotation = "Wd" + (score > 0 ? "+" + score : "");
    } else if (isNoBall) {
      newExtras += score + 1;
      newNoBalls += score + 1;
      newInningsScore += score + 1;
      ballNotation = "Nb+" + score;
    } else if (isByes) {
      newExtras += score;
      newByes += score;
      newInningsScore += score;
      ballNotation = "B" + score;
    } else if (isLegByes) {
      newExtras += score;
      newLegByes += score;
      newInningsScore += score;
      ballNotation = "Lb" + score;
    } else {
      newInningsScore += score;
      if (score === 4) ballNotation = "4";
      if (score === 6) ballNotation = "6";
    }

    const newCurrentOverBalls = overComplete
      ? []
      : [...innings.currentOverBalls, ballNotation];

    setInnings({
      ...innings,
      score: newInningsScore,
      overs: newInningsOvers,
      extras: newExtras,
      wides: newWides,
      noBalls: newNoBalls,
      byes: newByes,
      legByes: newLegByes,
      currentOverBalls: newCurrentOverBalls,
    });

    setBatsmen(updatedBatsmen);
    setBowlers(updatedBowlers);

    if ((!isWide && !isNoBall && score % 2 === 1) || overComplete) {
      handleSwapBatsmen();
    }

    // if (currentInnings === 1 && (newOvers >= totalOvers || innings.wickets >= 10)) {
    //   // ... setFirstInningsData and show modal
    //   setIsStartSecondInningsModalVisible(true);
    //   saveScoreboardData();
    // }

    // const isSecondInningsComplete =
    //   currentInnings === 2 &&
    //   (newInningsScore >= targetRuns || innings.wickets >= 10 || newOvers >= totalOvers);

    // if (isSecondInningsComplete) {
    //   setMatchComplete(true);
    //   setIsMatchResultModalVisible(true);
    //   message.success("Match completed!");
    //   saveScoreboardData();
    // } else if (currentInnings === 1 && (newOvers >= totalOvers || innings.wickets >= 10)) {
    //   setFirstInningsData({
    //     team: team1,
    //     score: newInningsScore,
    //     wickets: innings.wickets,
    //     overs: newInningsOvers,
    //     batsmen: [...updatedBatsmen, ...outBatsmen],
    //     bowlers: updatedBowlers.filter((b) => b.balls > 0),
    //     extras: newExtras,
    //   });
    //   setIsStartSecondInningsModalVisible(true);
    //   saveScoreboardData();
    // } else {
    //   saveScoreboardData();
    // }

    const isFirstInningsEnded = currentInnings === 1 && (newOvers >= totalOvers || innings.wickets >= 10);
  const isSecondInningsComplete =
    currentInnings === 2 &&
    (newInningsScore >= targetRuns || innings.wickets >= 10 || newOvers >= totalOvers);

    if (isFirstInningsEnded) {
      setFirstInningsData({
        score: newInningsScore,
        wickets: innings.wickets,
        overs: newInningsOvers,
        extras: {
          total: newExtras,
          wides: newWides,
          noBalls: newNoBalls,
          byes: newByes,
          legByes: newLegByes,
        },
        batsmen: [...updatedBatsmen, ...outBatsmen],
        bowlers: updatedBowlers.filter((b) => b.balls > 0),
      });
      setIsStartSecondInningsModalVisible(true);
      saveScoreboardData();
    } else if (isSecondInningsComplete) {
      setSecondInningsData({
        score: newInningsScore,
        wickets: innings.wickets,
        overs: newInningsOvers,
        extras: {
          total: newExtras,
          wides: newWides,
          noBalls: newNoBalls,
          byes: newByes,
          legByes: newLegByes,
        },
        batsmen: [...updatedBatsmen, ...outBatsmen],
        bowlers: updatedBowlers.filter((b) => b.balls > 0),
      });
      
      setMatchComplete(true);
      setIsMatchResultModalVisible(true);
      message.success("Match completed!");
      saveScoreboardData();
    } else {
      saveScoreboardData();
    }

    if (overComplete && !matchComplete && newOvers < totalOvers) {
      setIsBowlerModalVisible(true);
    }

    setIsWide(false);
    setIsNoBall(false);
    setIsByes(false);
    setIsLegByes(false);
    setIsWicket(false);
  };

  const handleWicketCheckbox = (e) => {
    setIsWicket(e.target.checked);
    if (e.target.checked) {
      setIsWicketModalVisible(true);
    }
  };

  const handleAddBatsman = (values) => {
    saveToHistory();

    const strikerIndex = batsmen.findIndex((b) => b.onStrike);
    const nonStrikerIndex = batsmen.findIndex((b) => !b.onStrike);
    const isNonStrikerRunOut = values.wicketType === "Run Out (Non-Striker)";
    const outBatsmanIndex = isNonStrikerRunOut ? nonStrikerIndex : strikerIndex;

    const updatedBowlers = !values.wicketType.includes("Run Out")
      ? bowlers.map((b, i) =>
          i === currentBowler ? { ...b, wickets: b.wickets + 1 } : b
        )
      : [...bowlers];

    const fielderName = values.fielderKey
      ? (currentInnings === 1 ? team2Players : team1Players).find((p) => p.key === values.fielderKey)?.name
      : "";

    const updatedBatsmen = batsmen.map((b, i) =>
      i === outBatsmanIndex
        ? {
            ...b,
            status: "Out",
            outType: values.wicketType + (fielderName ? ` (${fielderName})` : ""),
            onStrike: false,
          }
        : b
    );
    const outBatsman = updatedBatsmen[outBatsmanIndex];
    setOutBatsmen([...outBatsmen, outBatsman]);

    const newBatsmanIndex = availableBatsmen.findIndex(
      (b) => b.key === values.batsmanKey
    );
    const newBatsman = {
      ...availableBatsmen[newBatsmanIndex],
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      onStrike: !isNonStrikerRunOut,
      status: "Not Out",
      outType: "",
    };

    const newAvailableBatsmen = availableBatsmen.filter(
      (_, i) => i !== newBatsmanIndex
    );
    updatedBatsmen[outBatsmanIndex] = newBatsman;

    let newBalls = currentBall;
    let newOvers = currentOver;
    let overComplete = false;

    if (!isWide && !isNoBall) {
      newBalls += 1;
      if (newBalls === 6) {
        newBalls = 0;
        newOvers += 1;
        overComplete = true;
      }
    }

    const newInningsOvers = isWide || isNoBall ? innings.overs : newOvers + newBalls / 10;
    const newCurrentOverBalls = overComplete
      ? []
      : [...innings.currentOverBalls, "W"];

    setInnings({
      ...innings,
      wickets: innings.wickets + 1,
      overs: newInningsOvers,
      currentOverBalls: newCurrentOverBalls,
    });

    setBatsmen(updatedBatsmen);
    setBowlers(updatedBowlers);
    setAvailableBatsmen(newAvailableBatsmen);

    // const isSecondInningsComplete =
    //   currentInnings === 1 &&
    //   (innings.score >= targetRuns || innings.wickets + 1 >= 10 || newOvers >= totalOvers);

    // if (isSecondInningsComplete) {
    //   setMatchComplete(true);
    //   setIsMatchResultModalVisible(true);
    //   message.success("Match completed!");
    //   saveScoreboardData();
    // } else if (currentInnings === 1 && (innings.wickets + 1 === 10 || newOvers >= totalOvers)) {
    //   setFirstInningsData({
    //     team: team1,
    //     score: innings.score,
    //     wickets: innings.wickets + 1,
    //     overs: newInningsOvers,
    //     batsmen: [...updatedBatsmen, ...outBatsmen],
    //     bowlers: updatedBowlers.filter((b) => b.balls > 0),
    //     extras: innings.extras,
    //   });
    //   setIsStartSecondInningsModalVisible(true);
    //   saveScoreboardData();
    // } else {
    //   saveScoreboardData();
    // }

    const isFirstInningsEnded = currentInnings === 1 && (innings.wickets + 1 >= 10 || newOvers >= totalOvers);
  const isSecondInningsComplete =
    currentInnings === 2 &&
    (innings.score >= targetRuns || innings.wickets + 1 >= 10 || newOvers >= totalOvers);

  if (isFirstInningsEnded) {
    setFirstInningsData({
      score: innings.score,
      wickets: innings.wickets + 1,
      overs: newInningsOvers,
      extras: {
        total: innings.extras,
        wides: innings.wides,
        noBalls: innings.noBalls,
        byes: innings.byes,
        legByes: innings.legByes,
      },
      batsmen: [...updatedBatsmen, ...outBatsmen],
      bowlers: updatedBowlers.filter((b) => b.balls > 0),
    });
    setIsStartSecondInningsModalVisible(true);
    saveScoreboardData();
  } else if (isSecondInningsComplete) {
    const secondInnFinalData=({
      score: innings.score,
      wickets: innings.wickets + 1,
      overs: newInningsOvers,
      extras: {
        total: innings.extras,
        wides: innings.wides,
        noBalls: innings.noBalls,
        byes: innings.byes,
        legByes: innings.legByes,
      },
      batsmen: [...updatedBatsmen, ...outBatsmen],
      bowlers: updatedBowlers.filter((b) => b.balls > 0),
    });
    setSecondInningsData(secondInnFinalData);
    setMatchComplete(true);
    setIsMatchResultModalVisible(true);
    // setIsScorecardModalVisible(true);
    message.success("Match completed!");
    saveScoreboardData();
    console.log("Second innings complete (wicket), data:", secondInnFinalData);
  } else {
    saveScoreboardData();
  }

    if (overComplete && !matchComplete) {
      setIsBowlerModalVisible(true);
      if (!isNonStrikerRunOut) handleSwapBatsmen();
    }

    setIsWide(false);
    setIsNoBall(false);
    setIsByes(false);
    setIsLegByes(false);
    setIsWicket(false);
    setIsWicketModalVisible(false);
    form.resetFields();
  };

  const handleSwapBatsmen = () => {
    setBatsmen((prev) =>
      prev.map((b) => ({ ...b, onStrike: !b.onStrike }))
    );
  };

  const handleRetireBatsman = () => {
    if (availableBatsmen.length === 0) {
      message.error("No available batsmen to replace!");
      return;
    }

    const retireFormRef = React.createRef();

    Modal.confirm({
      title: "Retire Batsman",
      content: (
        <Form
          ref={retireFormRef}
          name="retireForm"
          layout="vertical"
          onFinish={(values) => {
            saveToHistory();
            const retiringBatsmanIndex = batsmen.findIndex(
              (b) => b.key === values.retiringBatsmanKey
            );
            const newBatsmanIndex = availableBatsmen.findIndex(
              (b) => b.key === values.newBatsmanKey
            );

            const retiringBatsman = batsmen[retiringBatsmanIndex];
            const newBatsmanData = availableBatsmen[newBatsmanIndex];

            const newBatsman = {
              key: newBatsmanData.key,
              name: newBatsmanData.name,
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              strikeRate: 0,
              onStrike: retiringBatsman.onStrike,
              status: "Not Out",
              outType: "",
            };

            setBatsmen((prev) =>
              prev.map((b, i) =>
                i === retiringBatsmanIndex
                  ? newBatsman
                  : b
              )
            );

            setOutBatsmen((prev) => [
              ...prev,
              { ...retiringBatsman, status: "Retired Hurt", onStrike: false },
            ]);

            setAvailableBatsmen((prev) => [
              ...prev.filter((b) => b.key !== newBatsmanData.key),
              { key: retiringBatsman.key, name: retiringBatsman.name },
            ]);

            saveScoreboardData();
            message.success(
              `${retiringBatsman.name} retired and replaced by ${newBatsman.name}`
            );
          }}
        >
          <Form.Item
            name="retiringBatsmanKey"
            label="Select Batsman to Retire"
            rules={[{ required: true, message: "Please select a batsman to retire" }]}
          >
            <Select placeholder="Select batsman to retire">
              {batsmen
                .filter((b) => b.status === "Not Out")
                .map((batsman) => (
                  <Option key={batsman.key} value={batsman.key}>
                    {batsman.name} {batsman.onStrike ? "(on strike)" : ""}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="newBatsmanKey"
            label="Select New Batsman"
            rules={[{ required: true, message: "Please select a new batsman" }]}
          >
            <Select placeholder="Select new batsman">
              {availableBatsmen.map((batsman) => (
                <Option key={batsman.key} value={batsman.key}>
                  {batsman.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      ),
      okText: "Confirm Retirement",
      cancelText: "Cancel",
      onOk: () => retireFormRef.current?.submit(),
    });
  };

  const handleUndo = () => {
    if (ballHistory.length === 0) {
      message.info("Nothing to undo");
      return;
    }

    const lastState = ballHistory[ballHistory.length - 1];
    
    setInnings(lastState.innings);
    setBatsmen(lastState.batsmen);
    setBowlers(lastState.bowlers);
    setCurrentBowler(lastState.currentBowler);
    setIsWide(lastState.isWide || false);
    setIsNoBall(lastState.isNoBall || false);
    setIsByes(lastState.isByes || false);
    setIsLegByes(lastState.isLegByes || false);
    setOutBatsmen(lastState.outBatsmen || []);
    setAvailableBatsmen(lastState.availableBatsmen || []);
    setBallHistory(ballHistory.slice(0, -1));

    if (currentInnings === 1 && firstInningsData) {
      setFirstInningsData(null);
      setIsStartSecondInningsModalVisible(false);
      message.success("Returned to first innings!");
    }

    if (matchComplete) {
      setMatchComplete(false);
      setIsMatchResultModalVisible(false);
    }

    saveScoreboardData();
  };

  const saveToHistory = () => {
    setBallHistory((prev) => [
      ...prev,
      {
        innings: { ...innings },
        batsmen: JSON.parse(JSON.stringify(batsmen)),
        bowlers: JSON.parse(JSON.stringify(bowlers)),
        currentBowler,
        outBatsmen: JSON.parse(JSON.stringify(outBatsmen)),
        availableBatsmen: JSON.parse(JSON.stringify(availableBatsmen)),
        isWide,
        isNoBall,
        isByes,
        isLegByes,
      },
    ]);
  };

  const handleEndInnings = () => {
    setIsEndInningsModalVisible(true);
  };

  const confirmEndInnings = () => {
    if (currentInnings === 1) {
      setFirstInningsData({
        team: team1,
        score: innings.score,
        wickets: innings.wickets,
        overs: innings.overs,
        batsmen: [...batsmen, ...outBatsmen],
        bowlers: bowlers.filter((b) => b.balls > 0),
        extras: innings.extras,
      });
      setIsStartSecondInningsModalVisible(true);
    } else if (currentInnings === 2) {
      setMatchComplete(true);
      setIsMatchResultModalVisible(true);
      message.success("Match completed!");
    }
    setIsEndInningsModalVisible(false);
    saveScoreboardData();
  };

  const showScorecard = () => {
    setIsScorecardModalVisible(true);
  };

  const handleSelectBowler = (bowlerKey) => {
    const newBowlerIndex = bowlers.findIndex((b) => b.key === bowlerKey);
    if (newBowlerIndex === currentBowler) {
      message.error("Same bowler cannot bowl consecutive overs!");
      return;
    }
    setCurrentBowler(newBowlerIndex);
    setIsBowlerModalVisible(false);
    saveScoreboardData();
  };

  const handleEndMatch = () => {
    setIsMatchResultModalVisible(false);
    setIsScorecardModalVisible(true);
    saveScoreboardData();
  };

  const getMatchResult = () => {
    if (!firstInningsData || currentInnings < 2) return "Match in progress...";
    const firstScore = firstInningsData.score;
    const secondScore = innings.score;
    if (firstScore > secondScore) {
      return `${team1} won by ${firstScore - secondScore} runs!`;
    } else if (secondScore >= firstScore + 1) {
      return `${team2} won by ${10 - innings.wickets} wickets!`;
    } else {
      return "Match tied!";
    }
  };

  const handleShare = () => {
    const matchSummary = `
🏏 CricPulse Match Summary 🏏
🏟 Match: ${matchDetails.matchName}
👥 Teams: ${team1} vs ${team2}
✅ ${team1} - ${firstInningsData?.score}/${firstInningsData?.wickets} in ${firstInningsData?.overs} overs (1st Innings)
✅ ${team2} - ${innings.score}/${innings.wickets} in ${innings.overs} overs (2nd Innings)
💥 Result: ${getMatchResult()}
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

  const handleStartSecondInnings = () => {
    setIsStartSecondInningsModalVisible(false);
    setIsSecondInningsSetupModalVisible(true);
  };

  const handleSecondInningsSetup = (values) => {
    const { strikeBatsmanKey, nonStrikeBatsmanKey, bowlerKey } = values;
    const strikeBatsmanName = team2Players.find((p) => p.key === strikeBatsmanKey)?.name;
    const nonStrikeBatsmanName = team2Players.find((p) => p.key === nonStrikeBatsmanKey)?.name;

    if (strikeBatsmanName === nonStrikeBatsmanName) {
      message.error("Strike and non-strike batsmen cannot be the same!");
      return;
    }

    setCurrentInnings(2);
    resetForNewInnings(team2, team1, strikeBatsmanName, nonStrikeBatsmanName, bowlerKey);
    setIsSecondInningsSetupModalVisible(false);
    message.success("Second innings started!");
    saveScoreboardData();
  };

  if (loading) return <Spin size="large" />;
  if (error) return <Text type="danger">{error}</Text>;

  // const handleHome=()=>{
  //   navigate('/')
  // }

 

  return (
    <Layout className="cricket-app">
      <Header className="app-header">
        {/* <span>
        <Button type="text" icon={<ArrowLeftOutlined />} style={{ color: "1e295e" }} />
        </span> */}
        <span>
        <Title level={4} className="title-text">
          {currentInnings === 1 ? team1 : team2} vs {currentInnings === 1 ? team2 : team1} - Innings {currentInnings} - Total Overs: {totalOvers}
          {currentInnings === 2 && ` - Target: ${targetRuns}`}
        </Title>
        </span>
        {/* <span>
        <Button type="primary" shape="circle" icon={<HomeOutlined />} className="home-button" onClick={handleHome}/>
        </span> */}
      </Header>

      <Content style={{ padding: "0 16px" }}>
        <Row justify="space-between" align="middle" style={{ margin: "16px 0" }}>
          <Col>
            <Text className="label-text">{currentInnings === 1 ? team1 : team2}</Text>
            <br />
            <Text className="score-display">
              {innings.score} / {innings.wickets}
            </Text>
            {currentInnings === 2 && (
              <Text style={{ display: "block", fontSize: "14px", color: "#555" }}>
                Need {remainingRuns} runs in {remainingBalls} balls (RRR: {requiredRunRate})
              </Text>
            )}
          </Col>
          <Col>
            <Button type="primary" className="scorecard-button" onClick={showScorecard}>
              Scorecard
            </Button>
          </Col>
          <Col style={{ textAlign: "right" }}>
            <Text className="label-text">Over</Text>
            <br />
            <Text className="score-display">
              {currentOver}.{currentBall}
            </Text>
          </Col>
        </Row>

        <Row style={{ marginBottom: "16px" }}>
          <Col span={24}>
            <Text className="current-over-text">
              This Over: {innings.currentOverBalls.join(" ")}
            </Text>
          </Col>
        </Row>

        <div className="cricket-table">
          <Table
            columns={[
              {
                title: "Batsman",
                dataIndex: "name",
                key: "name",
                render: (text, record) => (
                  <Text className="purple-text">
                    {text}
                    {record.onStrike ? " *" : ""}
                  </Text>
                ),
              },
              { title: "Runs", dataIndex: "runs", key: "runs", align: "center" },
              { title: "Balls", dataIndex: "balls", key: "balls", align: "center" },
              { title: "4s", dataIndex: "fours", key: "fours", align: "center" },
              { title: "6s", dataIndex: "sixes", key: "sixes", align: "center" },
              {
                title: "SR",
                dataIndex: "strikeRate",
                key: "strikeRate",
                align: "center",
                render: (text) => text.toFixed(2),
              },
            ]}
            dataSource={batsmen.filter((b) => b.status === "Not Out")}
            pagination={false}
            size="small"
            rowKey="key"
          />
        </div>

        <div className="cricket-table">
          <Table
            columns={[
              {
                title: "Bowler",
                dataIndex: "name",
                key: "name",
                render: (text) => <Text className="purple-text">{text}</Text>,
              },
              {
                title: "O",
                dataIndex: "overs",
                key: "overs",
                align: "center",
                render: (_, record) => `${Math.floor(record.balls / 6)}.${record.balls % 6}`,
              },
              { title: "W", dataIndex: "wickets", key: "wickets", align: "center" },
              { title: "R", dataIndex: "runs", key: "runs", align: "center" },
              {
                title: "Econ",
                key: "economy",
                align: "center",
                render: (_, record) =>
                  record.balls === 0 ? "0.00" : (record.runs / (record.balls / 6)).toFixed(2),
              },
            ]}
            dataSource={bowlers.filter((_, index) => index === currentBowler)}
            pagination={false}
            size="small"
            rowKey="key"
          />
        </div>

        {(() => {
          // const isFirstInningsComplete = currentInnings === 1 && firstInningsData;
          const isFirstInningsComplete = currentInnings === 1 && 
  (innings.overs >= totalOvers || innings.wickets >= 10 || firstInningsData?.matchComplete);
          return (
            <>
              <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Button
                    className="action-button"
                    onClick={handleSwapBatsmen}
                    icon={<SwapOutlined />}
                    disabled={matchComplete || isFirstInningsComplete}
                  >
                    Swap
                  </Button>
                </Col>
                <Col span={8}>
                  <Checkbox
                    className="cricket-checkbox"
                    checked={isWide}
                    onChange={(e) => {
                      setIsWide(e.target.checked);
                      if (e.target.checked) setIsNoBall(false), setIsByes(false), setIsLegByes(false);
                    }}
                    disabled={matchComplete || isFirstInningsComplete}
                  >
                    Wide
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox
                    className="cricket-checkbox"
                    checked={isNoBall}
                    onChange={(e) => {
                      setIsNoBall(e.target.checked);
                      if (e.target.checked) setIsWide(false);
                    }}
                    disabled={matchComplete || isFirstInningsComplete}
                  >
                    NoBall
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Button
                    className="action-button"
                    onClick={handleRetireBatsman}
                    disabled={matchComplete || isFirstInningsComplete}
                  >
                    Retire
                  </Button>
                </Col>
                <Col span={8}>
                  <Checkbox
                    className="cricket-checkbox"
                    checked={isByes}
                    onChange={(e) => {
                      setIsByes(e.target.checked);
                      if (e.target.checked) setIsLegByes(false), setIsWide(false);
                    }}
                    disabled={matchComplete || isFirstInningsComplete}
                  >
                    Byes
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox
                    className="cricket-checkbox"
                    checked={isLegByes}
                    onChange={(e) => {
                      setIsLegByes(e.target.checked);
                      if (e.target.checked) setIsByes(false), setIsWide(false);
                    }}
                    disabled={matchComplete || isFirstInningsComplete}
                  >
                    LegByes
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Button
                    className="end-button"
                    onClick={handleEndInnings}
                    icon={<PoweroffOutlined />}
                   
                  >
                    End Innings
                  </Button>
                </Col>
                <Col span={8}>
                  <Checkbox
                    className="cricket-checkbox"
                    checked={isWicket}
                    onChange={handleWicketCheckbox}
                    disabled={matchComplete || isFirstInningsComplete}
                  >
                    Wicket
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Button className="action-button" onClick={handleUndo} icon={<RedoOutlined />}>
                    Undo
                  </Button>
                </Col>
              </Row>

              <Title level={5} className="title-text" style={{ textAlign: "center", marginBottom: 16 , color:"red"}}>
                Select score to update
              </Title>

              <Row gutter={[8, 8]} justify="center" style={{ marginBottom: 24 }}>
                {[0, 1, 2, 3, 4, 5, 6].map((score) => (
                  <Col key={score}>
                    <Button
                      shape="circle"
                      size="large"
                      className="score-button"
                      onClick={() => handleScoreClick(score)}
                      disabled={matchComplete || isBowlerModalVisible || isFirstInningsComplete}
                    >
                      {score}
                    </Button>
                  </Col>
                ))}
              </Row>
            </>
          );
        })()}

        <Modal
          title="Wicket Occurred"
          open={isWicketModalVisible}
          onCancel={() => {
            setIsWicketModalVisible(false);
            setIsWicket(false);
          }}
          footer={null}
        >
          <Form form={form} onFinish={handleAddBatsman} layout="vertical">
            <Form.Item
              name="wicketType"
              label="Wicket Type"
              rules={[{ required: true, message: "Please select wicket type" }]}
            >
              <Select
                placeholder="Select wicket type"
                onChange={(value) => {
                  form.setFieldsValue({ fielderKey: undefined });
                }}
              >
                {[
                  "Bowled",
                  "Caught",
                  "Run Out (Striker)",
                  "Run Out (Non-Striker)",
                  "Stumped",
                  "Hit Wicket",
                  "LBW",
                ].map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.wicketType !== currentValues.wicketType
              }
            >
              {({ getFieldValue }) => {
                const wicketType = getFieldValue("wicketType");
                const requiresFielder = [
                  "Caught",
                  "Run Out (Striker)",
                  "Run Out (Non-Striker)",
                  "Stumped",
                ].includes(wicketType);
                const bowlingTeamPlayers = currentInnings === 1 ? team2Players : team1Players;

                if (requiresFielder) {
                  return (
                    <Form.Item
                      name="fielderKey"
                      label="Fielder"
                      rules={[{ required: true, message: "Please select a fielder" }]}
                    >
                      <Select placeholder="Select fielder">
                        {bowlingTeamPlayers.map((player) => (
                          <Option key={player.key} value={player.key}>
                            {player.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>

            <Form.Item
              name="batsmanKey"
              label="New Batsman"
              rules={[{ required: true, message: "Please select new batsman" }]}
            >
              <Select placeholder="Select new batsman">
                {availableBatsmen.map((batsman) => (
                  <Option key={batsman.key} value={batsman.key}>
                    {batsman.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Add Batsman
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="End Innings"
          open={isEndInningsModalVisible}
          onOk={confirmEndInnings}
          onCancel={() => setIsEndInningsModalVisible(false)}
        >
          <p>Are you sure you want to end the innings?</p>
        </Modal>

        <Modal
          title="First Innings Completed"
          open={isStartSecondInningsModalVisible}
          onOk={handleStartSecondInnings}
          onCancel={() => setIsStartSecondInningsModalVisible(false)}
        >
          <p>First innings completed! Would you like to start the second innings?</p>
        </Modal>

        <Modal
          title="Setup Second Innings"
          open={isSecondInningsSetupModalVisible}
          onCancel={() => setIsSecondInningsSetupModalVisible(false)}
          footer={null}
          closable={false}
        >
          <Form form={secondInningsForm} onFinish={handleSecondInningsSetup} layout="vertical">
            <Form.Item
              name="strikeBatsmanKey"
              label="Strike Batsman (Team 2)"
              rules={[{ required: true, message: "Please select strike batsman" }]}
            >
              <Select placeholder="Select strike batsman">
                {team2Players.map((player) => (
                  <Option key={player.key} value={player.key}>
                    {player.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="nonStrikeBatsmanKey"
              label="Non-Strike Batsman (Team 2)"
              rules={[{ required: true, message: "Please select non-strike batsman" }]}
            >
              <Select placeholder="Select non-strike batsman">
                {team2Players.map((player) => (
                  <Option key={player.key} value={player.key}>
                    {player.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="bowlerKey"
              label="Bowler (Team 1)"
              rules={[{ required: true, message: "Please select bowler" }]}
            >
              <Select placeholder="Select bowler">
                {team1Players.map((bowler) => (
                  <Option key={bowler.key} value={bowler.key}>
                    {bowler.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Start Second Innings
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Full Scorecard"
          open={isScorecardModalVisible}
          onCancel={() => setIsScorecardModalVisible(false)}
          width={800}
          footer={[
            <Button
              key="share"
              type="primary"
              onClick={handleShare}
              style={{ backgroundColor: "#4caf50", borderColor: "#4caf50" }}
            >
              Share Score
            </Button>,
            <Button key="close" onClick={() => setIsScorecardModalVisible(false)}>
              Close
            </Button>,
          ]}
        >
          <div className="scorecard-container">
            {firstInningsData && (
              <>
                <Title level={4} className="scorecard-title">
                  {team1}: {firstInningsData.score}/{firstInningsData.wickets} ({firstInningsData.overs} ov) - 1st Innings
                </Title>
                <Title level={5}>Batting</Title>
                <Table
                  columns={[
                    {
                      title: "Batsman",
                      dataIndex: "name",
                      key: "name",
                      render: (text, record) => (
                        <Text className="purple-text">
                          {text}
                          {record.onStrike ? " *" : ""}
                        </Text>
                      ),
                    },
                    { title: "Runs", dataIndex: "runs", key: "runs", align: "center" },
                    { title: "Balls", dataIndex: "balls", key: "balls", align: "center" },
                    { title: "4s", dataIndex: "fours", key: "fours", align: "center" },
                    { title: "6s", dataIndex: "sixes", key: "sixes", align: "center" },
                    {
                      title: "SR",
                      dataIndex: "strikeRate",
                      key: "strikeRate",
                      align: "center",
                      render: (text) => text.toFixed(2),
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      render: (text, record) =>
                        text === "Out" ? ` ${text} (${record.outType})` : text,
                    },
                  ]}
                  dataSource={firstInningsData.batsmen}
                  pagination={false}
                  size="small"
                  rowKey="key"
                />
                <Title level={5}>Bowling</Title>
                <Table
                  columns={[
                    {
                      title: "Bowler",
                      dataIndex: "name",
                      key: "name",
                      render: (text) => <Text className="purple-text">{text}</Text>,
                    },
                    {
                      title: "O",
                      dataIndex: "overs",
                      key: "overs",
                      align: "center",
                      // render: (_, record) => `${Math.floor(record.balls / 6)}.${record.balls % 6}`,
                      render: (overs) => overs || "0.0",
                    },
                    { title: "W", dataIndex: "wickets", key: "wickets", align: "center" },
                    { title: "R", dataIndex: "runs", key: "runs", align: "center" },
                    {
                      title: "Econ",
                      key: "economy",
                      align: "center",
                      // render: (_, record) =>
                      //   record.balls === 0 ? "0.00" : (record.runs / (record.balls / 6)).toFixed(2) || "0.00",
                      render: (_, record) => {
                        // Use precomputed economy if available, otherwise calculate it
                        if (record.economy !== undefined && record.economy !== null) {
                          return record.economy; // Assumes economy is stored as a string (e.g., "6.00")
                        }
                        const balls = record.balls || 0;
                        const runs = record.runs || 0;
                        return balls === 0 ? "0.00" : (runs / (balls / 6)).toFixed(2);
                      },
                    },
                    { title: "M", dataIndex: "maidenOvers", key: "maidenOvers", align: "center" },
                  ]}
                  dataSource={firstInningsData.bowlers}
                  pagination={false}
                  size="small"
                  rowKey="key"
                />
                <Title level={5}>Extras</Title>
                {/* <Text>Total Extras: {firstInningsData.extras}</Text> */}
                <Row gutter={16}>
      <Col span={6}><Text>Wides: {firstInningsData?.extras?.wides || 0}</Text></Col>
      <Col span={6}><Text>No Balls: {firstInningsData?.extras?.noBalls || 0}</Text></Col>
      <Col span={6}><Text>Byes: {firstInningsData?.extras?.byes || 0}</Text></Col>
      <Col span={6}><Text>Leg Byes: {firstInningsData?.extras?.legByes || 0}</Text></Col>
      <Col span={24} style={{ marginTop: 8 }}>
        <Text strong>Total Extras: {firstInningsData?.extras?.total || 0}</Text>
      </Col>
    </Row>
              </>
            )}

            <Title level={4} className="scorecard-title" style={{ marginTop: 16 }}>
              {currentInnings === 1 ? team1 : team2}: {innings.score}/{innings.wickets} ({innings.overs} ov) - {currentInnings}nd Innings
              {currentInnings === 2 && ` - Target: ${targetRuns}`}
            </Title>
            <Title level={5}>Batting</Title>
            <Table
              columns={[
                {
                  title: "Batsman",
                  dataIndex: "name",
                  key: "name",
                  render: (text, record) => (
                    <Text className="purple-text">
                      {text}
                      {record.onStrike ? " *" : ""}
                    </Text>
                  ),
                },
                { title: "Runs", dataIndex: "runs", key: "runs", align: "center" },
                { title: "Balls", dataIndex: "balls", key: "balls", align: "center" },
                { title: "4s", dataIndex: "fours", key: "fours", align: "center" },
                { title: "6s", dataIndex: "sixes", key: "sixes", align: "center" },
                {
                  title: "SR",
                  dataIndex: "strikeRate",
                  key: "strikeRate",
                  align: "center",
                  render: (text) => text.toFixed(2),
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                  render: (text, record) =>
                    text === "Out" ? `${text} (${record.outType})` : text,
                },
              ]}
              dataSource={[...batsmen, ...outBatsmen]}
              pagination={false}
              size="small"
              rowKey="key"
            />
            <Title level={5}>Bowling</Title>
            <Table
              columns={[
                {
                  title: "Bowler",
                  dataIndex: "name",
                  key: "name",
                  render: (text, record, index) => (
                    <Text className="purple-text">
                      {text}
                      {index === currentBowler ? " *" : ""}
                    </Text>
                  ),
                },
                {
                  title: "O",
                  dataIndex: "overs",
                  key: "overs",
                  align: "center",
                  render: (_, record) => `${Math.floor(record.balls / 6)}.${record.balls % 6}`,
                },
                { title: "W", dataIndex: "wickets", key: "wickets", align: "center" },
                { title: "R", dataIndex: "runs", key: "runs", align: "center" },
                {
                  title: "Econ",
                  key: "economy",
                  align: "center",
                  render: (_, record) =>
                    record.balls === 0 ? "0.00" : (record.runs / (record.balls / 6)).toFixed(2),
                },
                { title: "M", dataIndex: "maidenOvers", key: "maidenOvers", align: "center" },
              ]}
              dataSource={bowlers.filter((b) => b.balls > 0)}
              pagination={false}
              size="small"
              rowKey="key"
            />
            <Title level={5}>Extras</Title>
            <Row gutter={16}>
      <Col span={6}><Text>Wides: {secondInningsData?.extras?.wides || 0}</Text></Col>
      <Col span={6}><Text>No Balls: {secondInningsData?.extras?.noBalls || 0}</Text></Col>
      <Col span={6}><Text>Byes: {secondInningsData?.extras?.byes || 0}</Text></Col>
      <Col span={6}><Text>Leg Byes: {secondInningsData?.extras?.legByes || 0}</Text></Col>
      <Col span={24} style={{ marginTop: 8 }}>
        <Text strong>Total Extras: {secondInningsData?.extras?.total || 0}</Text>
      </Col>
    </Row>
            {currentInnings === 2 && remainingRuns > 0 && (
              <Text style={{ display: "block", marginTop: 8 }}>
                Need {remainingRuns} runs in {remainingBalls} balls (RRR: {requiredRunRate})
              </Text>
            )}
          </div>
        </Modal>

        

        <Modal
          title="Match Result"
          open={isMatchResultModalVisible}
          onCancel={() => setIsMatchResultModalVisible(false)}
          footer={[
            <Button key="end" type="primary" onClick={handleEndMatch}>
              End Match
            </Button>,
            <Button key="cancel" onClick={() => setIsMatchResultModalVisible(false)}>
              Cancel
            </Button>,
          ]}
        >
          <p>{getMatchResult()}</p>
          <p>{team1}: {firstInningsData?.score}/{firstInningsData?.wickets} ({firstInningsData?.overs} ov)</p>
          <p>{team2}: {secondInningsData?.score}/{secondInningsData?.wickets} ({secondInningsData?.overs} ov)</p>
        </Modal>

        <Modal
          title="Select New Bowler"
          open={isBowlerModalVisible}
          onCancel={() => {
            message.warning("Please select a new bowler to continue the match!");
          }}
          footer={null}
          closable={false}
        >
          <Select
            style={{ width: "100%" }}
            placeholder="Select new bowler"
            onChange={handleSelectBowler}
          >
            {bowlers.map((bowler) => (
              <Option key={bowler.key} value={bowler.key}>
                {bowler.name}
              </Option>
            ))}
          </Select>
        </Modal>
      </Content>
    </Layout>
  );
};

export default Scoreboard;