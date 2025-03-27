/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Switch,
  Form,
  Input,
  message,
  Upload,
  List,
  Spin,
  Modal,
} from "antd";
import {
  EditOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { confirm } = Modal;

const UserCreatedMatches = ({
  matches,
  loading,
  onDeleteMatch,
  onViewDetails,
}) => {
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
                  <Text>
                    {" "}
                    (Captain: {player.tag === "captain" ? "Yes" : "No"})
                  </Text>
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
              {match.matchEnd && renderScorecard(match.teams)}
              <Button type="link" onClick={() => onViewDetails(match.matchId)}>
                View ScoreCard
              </Button>
              <Button
                type="danger"
                onClick={() => onDeleteMatch(match.matchId, match.matchName)}
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

const UserProfile = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found, please login");
        window.location.href = "/login";
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/auth/getuser", {
          method: "GET",
          headers: { "x-auth-token": token },
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP error ${response.status}: ${text}`);
        }
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("createdById", data.user.id);
        form.setFieldsValue({
          username: data.user.username,
          email: data.user.email,
        });
      } catch (err) {
        console.error("Error fetching user profile:", err.message);
        setError(err.message);
        if (
          err.message.includes("Token expired") ||
          err.message.includes("Token is not valid")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("createdById");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [form]);

  useEffect(() => {
    const fetchMatches = async () => {
      const createdById = localStorage.getItem("createdById");
      if (!createdById) return;

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/matches/createdBy/${createdById}`,
          {
            method: "GET",
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch matches");
        const responseData = await response.json();
        const matchesArray = responseData.data || [];
        const formattedData = matchesArray.map((match) => {
          const teamA = match.teams[0].name;
          const teamB = match.teams[1].name;
          const tournamentName = match.tournamentName;
          let matchStatus = !match.firstInningsEnd
            ? "First Innings"
            : match.firstInningsEnd && !match.secondInningsStart
            ? "Innings Break"
            : match.secondInningsStart
            ? "Second Innings"
            : "Match Completed";
          if (match.matchEnd) matchStatus = "Match Completed";
          return {
            matchId: match.matchId,
            matchName: `${teamA} vs ${teamB}`,
            tournamentName,
            matchStatus,
            matchEnd: match.matchEnd,
            teams: match.teams,
          };
        });
        setMatches(formattedData);
      } catch (error) {
        console.error("Error fetching matches:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMatches();
  }, [user]);

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleUpdateProfile = async (values) => {
    const token = localStorage.getItem("token");
    setLoading(true);

    const formData = new FormData();
    if (values.username) formData.append("username", values.username);
    if (values.email) formData.append("email", values.email);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("profilePicture", fileList[0].originFileObj);
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/updateprofile",
        {
          method: "PUT",
          headers: { "x-auth-token": token },
          body: formData,
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error ${response.status}: ${text}`);
      }

      const data = await response.json();
      setUser((prevUser) => ({ ...prevUser, ...data.user }));
      localStorage.setItem("token", data.user.token);
      setIsModalVisible(false);
      setFileList([]);
      message.success("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err.message);
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = (matchId, matchName) => {
    confirm({
      title: "Are you sure?",
      content: `Do you really want to delete the match "${matchName}"? This action cannot be undone.`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
          const response = await fetch(
            `http://localhost:5000/api/matches/${matchId}`,
            {
              method: "DELETE",
              headers: { "x-auth-token": token },
            }
          );

          if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP error ${response.status}: ${text}`);
          }

          setMatches(matches.filter((match) => match.matchId !== matchId));
          message.success("Match deleted successfully");
        } catch (error) {
          console.error("Error deleting match:", error.message);
          message.error("Failed to delete match");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleViewDetails = (matchId) => {
    navigate(`/scoresCard/${matchId}`, { state: { matchId } });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("createdById");
    localStorage.removeItem("matchID");
    window.location.href = "/login";
  };

  const showEditModal = () => {
    form.setFieldsValue({
      username: user.username,
      email: user.email,
    });
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setFileList([]);
  };

  if (loading) return <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>;
  if (error) return <div style={{ textAlign: "center", padding: "20px", color: "red" }}>Error: {error}</div>;
  if (!user) return null;

  const avatarSrc = user.profilePicture
    ? `http://localhost:5000${user.profilePicture}?t=${Date.now()}`
    : null;

  return (
    <div
      style={{
        padding: "84px 20px 20px",
        backgroundColor: darkMode ? "#141414" : "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Card style={{ textAlign: "center", marginBottom: "20px" }}>
        <Avatar
          src={avatarSrc}
          size={128}
          alt="Profile"
          onError={() => true}
          icon={<UserOutlined style={{ fontSize: 64, color: "#ccc" }} />}
        />
        <Title level={2} style={{ marginTop: "10px" }}>
          {user.username}
        </Title>
        <Text type="secondary">{user.email}</Text>
        <br />
        <Text type="secondary">Username: {user.username}</Text>
        <br />
        <Button
          type="primary"
          icon={<EditOutlined />}
          style={{
            marginTop: "10px",
            background: "#1e295e",
            border: "none",
            color: "white",
            transition: "background 0.3s ease",
          }}
          onClick={showEditModal}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#2e3a7e")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1e295e")}
        >
          Edit Profile
        </Button>
      </Card>

      <Modal
        title="Edit Profile"
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleUpdateProfile}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Invalid email!" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item label="Profile Picture">
            <Upload
              name="profilePicture"
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}
              accept="image/jpeg,image/jpg,image/png"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select Profile Picture</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save
            </Button>
            <Button style={{ marginLeft: "10px" }} onClick={handleModalCancel}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <UserCreatedMatches
        matches={matches}
        loading={loading}
        onDeleteMatch={handleDeleteMatch}
        onViewDetails={handleViewDetails}
      />

      <Card style={{ textAlign: "center" }}>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Card>
    </div>
  );
};

export default UserProfile;




///////////////////////////////////////////////////////////////////////////////

/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import { useState, useEffect } from "react";
// import {
//   Avatar,
//   Button,
//   Card,
//   Row,
//   Col,
//   Typography,
//   Switch,
//   Form,
//   Input,
//   message,
//   Upload,
//   List,
//   Spin,
//   Modal,
//   Tabs,
// } from "antd";
// import {
//   EditOutlined,
//   LogoutOutlined,
//   UserOutlined,
//   SettingOutlined,
//   UploadOutlined,
// } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";

// const { Title, Text } = Typography;
// const { confirm } = Modal;
// const { TabPane } = Tabs; // For Ant Design Tabs

// const UserCreatedMatches = ({
//   matches,
//   loading,
//   onDeleteMatch,
//   onViewDetails,
// }) => {
//   const renderScorecard = (teams) => {
//     return (
//       <div>
//         <Title level={4}>Scorecard</Title>
//         {teams.map((team, index) => (
//           <Card key={index} style={{ marginBottom: "10px" }}>
//             <Title level={5}>{team.name}</Title>
//             <Row gutter={[16, 16]}>
//               {team.players.map((player, playerIndex) => (
//                 <Col key={playerIndex} span={12}>
//                   <Text strong>{player.name}</Text>
//                   <Text>
//                     {" "}
//                     (Captain: {player.tag === "captain" ? "Yes" : "No"})
//                   </Text>
//                   <br />
//                   <Text>Runs: {player.status.runs}</Text>
//                   <br />
//                   <Text>Wickets: {player.status.wickts}</Text>
//                 </Col>
//               ))}
//             </Row>
//           </Card>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <Card title="📋 Created Matches" style={{ marginBottom: "20px" }}>
//       {loading ? (
//         <Spin size="large" />
//       ) : matches.length > 0 ? (
//         <List
//           dataSource={matches}
//           renderItem={(match) => (
//             <List.Item>
//               <List.Item.Meta
//                 title={<Text strong>{match.matchName}</Text>}
//                 description={
//                   <>
//                     <Text>Tournament: {match.tournamentName}</Text>
//                     <br />
//                     <Text>Status: {match.matchStatus}</Text>
//                   </>
//                 }
//               />
//               {match.matchEnd && renderScorecard(match.teams)}
//               <Button type="link" onClick={() => onViewDetails(match.matchId)}>
//                 View ScoreCard
//               </Button>
//               <Button
//                 type="danger"
//                 onClick={() => onDeleteMatch(match.matchId, match.matchName)}
//                 style={{ marginLeft: "10px" }}
//               >
//                 Delete
//               </Button>
//             </List.Item>
//           )}
//         />
//       ) : (
//         <Text type="secondary">No matches created yet.</Text>
//       )}
//     </Card>
//   );
// };

// const UserProfile = () => {
//   const [darkMode, setDarkMode] = useState(false);
//   const [matches, setMatches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [user, setUser] = useState(null);
//   const [error, setError] = useState(null);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [fileList, setFileList] = useState([]);
//   const [form] = Form.useForm();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("No token found, please login");
//         window.location.href = "/login";
//         return;
//       }

//       setLoading(true);
//       try {
//         const response = await fetch("http://localhost:5000/api/auth/getuser", {
//           method: "GET",
//           headers: { "x-auth-token": token },
//         });
//         if (!response.ok) {
//           const text = await response.text();
//           throw new Error(`HTTP error ${response.status}: ${text}`);
//         }
//         const data = await response.json();
//         setUser(data.user);
//         localStorage.setItem("createdById", data.user.id);
//         form.setFieldsValue({
//           username: data.user.username,
//           email: data.user.email,
//         });
//       } catch (err) {
//         console.error("Error fetching user profile:", err.message);
//         setError(err.message);
//         if (
//           err.message.includes("Token expired") ||
//           err.message.includes("Token is not valid")
//         ) {
//           localStorage.removeItem("token");
//           localStorage.removeItem("createdById");
//           window.location.href = "/login";
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserProfile();
//   }, [form]);

//   useEffect(() => {
//     const fetchMatches = async () => {
//       const createdById = localStorage.getItem("createdById");
//       if (!createdById) return;

//       setLoading(true);
//       try {
//         const response = await fetch(
//           `http://localhost:5000/api/matches/createdBy/${createdById}`,
//           {
//             method: "GET",
//             headers: { "x-auth-token": localStorage.getItem("token") },
//           }
//         );
//         if (!response.ok) throw new Error("Failed to fetch matches");
//         const responseData = await response.json();
//         const matchesArray = responseData.data || [];
//         const formattedData = matchesArray.map((match) => {
//           const teamA = match.teams[0].name;
//           const teamB = match.teams[1].name;
//           const tournamentName = match.tournamentName;
//           let matchStatus = !match.firstInningsEnd
//             ? "First Innings"
//             : match.firstInningsEnd && !match.secondInningsStart
//             ? "Innings Break"
//             : match.secondInningsStart
//             ? "Second Innings"
//             : "Match Completed";
//           if (match.matchEnd) matchStatus = "Match Completed";
//           return {
//             matchId: match.matchId,
//             matchName: `${teamA} vs ${teamB}`,
//             tournamentName,
//             matchStatus,
//             matchEnd: match.matchEnd,
//             teams: match.teams,
//           };
//         });
//         setMatches(formattedData);
//       } catch (error) {
//         console.error("Error fetching matches:", error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user) fetchMatches();
//   }, [user]);

//   const handleFileChange = ({ fileList }) => {
//     setFileList(fileList);
//   };

//   const handleUpdateProfile = async (values) => {
//     const token = localStorage.getItem("token");
//     setLoading(true);

//     const formData = new FormData();
//     if (values.username) formData.append("username", values.username);
//     if (values.email) formData.append("email", values.email);
//     if (fileList.length > 0 && fileList[0].originFileObj) {
//       formData.append("profilePicture", fileList[0].originFileObj);
//     }

//     try {
//       const response = await fetch(
//         "http://localhost:5000/api/auth/updateprofile",
//         {
//           method: "PUT",
//           headers: { "x-auth-token": token },
//           body: formData,
//         }
//       );

//       if (!response.ok) {
//         const text = await response.text();
//         throw new Error(`HTTP error ${response.status}: ${text}`);
//       }

//       const data = await response.json();
//       setUser((prevUser) => ({ ...prevUser, ...data.user }));
//       localStorage.setItem("token", data.user.token);
//       setIsModalVisible(false);
//       setFileList([]);
//       message.success("Profile updated successfully");
//     } catch (err) {
//       console.error("Error updating profile:", err.message);
//       message.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteMatch = (matchId, matchName) => {
//     confirm({
//       title: "Are you sure?",
//       content: `Do you really want to delete the match "${matchName}"? This action cannot be undone.`,
//       okText: "Yes",
//       okType: "danger",
//       cancelText: "No",
//       onOk: async () => {
//         const token = localStorage.getItem("token");
//         setLoading(true);
//         try {
//           const response = await fetch(
//             `http://localhost:5000/api/matches/${matchId}`,
//             {
//               method: "DELETE",
//               headers: { "x-auth-token": token },
//             }
//           );

//           if (!response.ok) {
//             const text = await response.text();
//             throw new Error(`HTTP error ${response.status}: ${text}`);
//           }

//           setMatches(matches.filter((match) => match.matchId !== matchId));
//           message.success("Match deleted successfully");
//         } catch (error) {
//           console.error("Error deleting match:", error.message);
//           message.error("Failed to delete match");
//         } finally {
//           setLoading(false);
//         }
//       },
//     });
//   };

//   const handleViewDetails = (matchId) => {
//     navigate(`/scoresCard/${matchId}`, { state: { matchId } });
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("createdById");
//     localStorage.removeItem("matchID");
//     window.location.href = "/login";
//   };

//   const showEditModal = () => {
//     form.setFieldsValue({
//       username: user.username,
//       email: user.email,
//     });
//     setIsModalVisible(true);
//   };

//   const handleModalCancel = () => {
//     setIsModalVisible(false);
//     setFileList([]);
//   };

//   if (loading) return <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>;
//   if (error) return <div style={{ textAlign: "center", padding: "20px", color: "red" }}>Error: {error}</div>;
//   if (!user) return null;

//   const avatarSrc = user.profilePicture
//     ? `http://localhost:5000${user.profilePicture}?t=${Date.now()}`
//     : null;

//   return (
//     <div
//       style={{
//         padding: "84px 20px 20px",
//         backgroundColor: darkMode ? "#141414" : "#f0f2f5",
//         minHeight: "100vh",
//       }}
//     >
//       <Tabs defaultActiveKey="profile" centered>
//         <TabPane tab="Profile" key="profile">
//           <Card style={{ textAlign: "center", marginBottom: "20px" }}>
//             <Avatar
//               src={avatarSrc}
//               size={128}
//               alt="Profile"
//               onError={() => true}
//               icon={<UserOutlined style={{ fontSize: 64, color: "#ccc" }} />}
//             />
//             <Title level={2} style={{ marginTop: "10px" }}>
//               {user.username}
//             </Title>
//             <Text type="secondary">{user.email}</Text>
//             <br />
//             <Text type="secondary">Username: {user.username}</Text>
//             <br />
//             <Button
//               type="primary"
//               icon={<EditOutlined />}
//               style={{
//                 marginTop: "10px",
//                 background: "#1e295e",
//                 border: "none",
//                 color: "white",
//                 transition: "background 0.3s ease",
//               }}
//               onClick={showEditModal}
//               onMouseEnter={(e) => (e.currentTarget.style.background = "#2e3a7e")}
//               onMouseLeave={(e) => (e.currentTarget.style.background = "#1e295e")}
//             >
//               Edit Profile
//             </Button>
//           </Card>
//         </TabPane>

//         <TabPane tab="Matches" key="matches">
//           <UserCreatedMatches
//             matches={matches}
//             loading={loading}
//             onDeleteMatch={handleDeleteMatch}
//             onViewDetails={handleViewDetails}
//           />
//         </TabPane>
//       </Tabs>

//       <Modal
//         title="Edit Profile"
//         open={isModalVisible}
//         onCancel={handleModalCancel}
//         footer={null}
//       >
//         <Form
//           form={form}
//           onFinish={handleUpdateProfile}
//           layout="vertical"
//         >
//           <Form.Item
//             name="username"
//             label="Username"
//             rules={[{ required: true, message: "Please input your username!" }]}
//           >
//             <Input placeholder="Username" />
//           </Form.Item>
//           <Form.Item
//             name="email"
//             label="Email"
//             rules={[
//               { required: true, message: "Please input your email!" },
//               { type: "email", message: "Invalid email!" },
//             ]}
//           >
//             <Input placeholder="Email" />
//           </Form.Item>
//           <Form.Item label="Profile Picture">
//             <Upload
//               name="profilePicture"
//               fileList={fileList}
//               onChange={handleFileChange}
//               beforeUpload={() => false}
//               accept="image/jpeg,image/jpg,image/png"
//               maxCount={1}
//             >
//               <Button icon={<UploadOutlined />}>Select Profile Picture</Button>
//             </Upload>
//           </Form.Item>
//           <Form.Item>
//             <Button type="primary" htmlType="submit" loading={loading}>
//               Save
//             </Button>
//             <Button style={{ marginLeft: "10px" }} onClick={handleModalCancel}>
//               Cancel
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>

//       <Card style={{ textAlign: "center", marginTop: "20px" }}>
//         <Button
//           type="primary"
//           danger
//           icon={<LogoutOutlined />}
//           onClick={handleLogout}
//         >
//           Logout
//         </Button>
//       </Card>
//     </div>
//   );
// };

// export default UserProfile;