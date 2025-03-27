import { Button, Card, Row, Col, Typography } from "antd";
import {
  PlayCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  StarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import "./Home.css"; // Import the CSS file
import Footer from "./Footer/Footer";
import UsersExp from "./UserExp/UserExperience";
import UserNumbers from "./UserNumbers/UsersNum";
import WhyCricHeroes from "./WhyCricPulse/Why";

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  const handleTossClick = () => {
    navigate("/toss");
  };

  const handleLiveScore = () => {
    navigate("/livematches");
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <Title level={1}>Welcome to CricPulse</Title>
        <Paragraph>
          Your ultimate companion for live cricket scores, match updates, and
          player stats.
        </Paragraph>
        <Button className="explore-btn"
          type="primary"
          size="large"
          icon={<PlayCircleOutlined />}
          onClick={() => navigate("/livematches")} // Add navigation if needed
        >
          Explore Now
        </Button>
      </div>

      <div>
        <WhyCricHeroes />
      </div>

      <div>
        <UserNumbers />
      </div>

      {/* Features Section */}
      <div className="features-section">
        <Title level={2} className="feature-heading">Features</Title>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} md={6} onClick={handleLiveScore}>
            <Card hoverable>
              <TrophyOutlined />
              <Title level={4}>Live Scores</Title>
              <Paragraph>Get real-time updates on ongoing matches.</Paragraph>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <TeamOutlined />
              <Title level={4}>Player Stats</Title>
              <Paragraph>Track player performance and records.</Paragraph>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <StarOutlined />
              <Title level={4}>Match Highlights</Title>
              <Paragraph>Watch key moments from matches.</Paragraph>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card hoverable onClick={handleTossClick}>
              <DollarOutlined />
              <Title level={4}>Toss a Coin</Title>
              <Paragraph>Decide the toss with a virtual coin flip.</Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <UsersExp />
      </div>

      {/* Footer */}
      <div className="footer">
        <Footer />
      </div>
    </div>
  );
};

export default Home;