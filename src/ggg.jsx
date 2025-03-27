import  { useState } from "react";
import { Menu, Drawer, Button } from "antd";
import { HomeOutlined, PlayCircleOutlined, PlusCircleOutlined, MenuOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [visible, setVisible] = useState(false);

  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);

  // Menu Items
  const menuItems = [
    { key: "home", label: <Link to="/">Home</Link>, icon: <HomeOutlined /> },
    { key: "live", label: <Link to="/live-matches">Live Matches</Link>, icon: <PlayCircleOutlined /> },
    { key: "new", label: <Link to="/new-match">New Match</Link>, icon: <PlusCircleOutlined /> },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", background: "#001529" }}>
      {/* Logo */}
      <h2 style={{ color: "white", margin: 0 }}>CricPulse</h2>

      {/* Desktop Menu */}
      <Menu theme="dark" mode="horizontal" items={menuItems} style={{ flex: 1, justifyContent: "center", display: "none", md: "flex" }} />

      {/* Mobile Menu Button */}
      <Button type="text" icon={<MenuOutlined />} onClick={showDrawer} style={{ color: "white" }} />

      {/* Mobile Drawer */}
      <Drawer title="Menu" placement="right" onClose={closeDrawer} open={visible}>
        <Menu mode="vertical" items={menuItems} />
      </Drawer>
    </div>
  );
};

export default Navbar;
