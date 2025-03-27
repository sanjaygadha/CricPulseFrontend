import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar/Navbar"; // Import Navbar
import Home from "./pages/Landingpage/Home";
import LiveMatches from "./pages/Livematches/LiveMatches";
import NewMatch from "./pages/CreateMatch/NewMatch";
import StartInnings from "./pages/CreateMatch/startInnings"; // Import StartInnings
// import Scorecard from "./pages/CreateMatch/ScoreCrad";
import Toss from "./pages/Toss/Toss";
import UserProfile from "./pages/Profile/UserProfile";
import TeamSetup from "./pages/CreateMatch/Teamcompo/TeamSetup";
import LoginPage from "./pages/Login/LoginPage";
import ContactUs from "./pages/ContactUs/ContactUs";
import Scoreboard from "./pages/CreateMatch/ScoreBoard";
import ScoresCard from "./pages/CreateMatch/scoresCard";


const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage/>}></Route>
        <Route path="/" element={<Home />} />
        <Route path="/livematches" element={<LiveMatches />} />
        <Route path="/newmatch" element={<NewMatch />}  />
        <Route path="/startinnings" element={<StartInnings />} />
        <Route path="/scoreboard/:matchID" element={<Scoreboard/>}></Route>
        <Route path="/toss" element={<Toss/>}></Route>
        <Route path="/profile" element={<UserProfile/>}></Route>
        <Route path="/teamsetup" element={<TeamSetup/>} ></Route>
        <Route path="/contact" element={<ContactUs/>}></Route>
        <Route path="/scoresCard/:matchID" element={<ScoresCard/>}></Route>
      </Routes>
    </>
  );
};

export default App;