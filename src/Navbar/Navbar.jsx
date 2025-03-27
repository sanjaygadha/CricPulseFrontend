import { useState, useEffect } from "react";
import { Drawer, Button, Menu, Dropdown } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import "./navbar.css";
import logo from './CricketPulsefinal.png';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Initial check for mobile
  const location = useLocation();

  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);

  // Check token on mount and update isLoggedIn
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Update state based on token presence
  }, []);

  // Detect window resize and update isMobile state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && visible) {
        // Close the drawer when switching to desktop view
        setVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [visible]);

  // Define menu items (stable base items)
  const baseMenuItems = [
    { key: "home", label: <Link to="/">Home</Link> },
    { key: "toss", label: <Link to="/toss">Toss</Link> },
    { key: "live", label: <Link to="/livematches">Live Matches</Link> },
    { key: "new", label: <Link to="/newmatch">New Match</Link> },
    { key: "contact", label: <Link to="/contact">Contact Us</Link> },
  ];

  // User menu items based on login status
  const userMenuItems = isLoggedIn
    ? [{ key: "profile", label: <Link to="/profile">Profile</Link> }]
    : [{ key: "login", label: <Link to="/login">SignUp</Link> }];

  // Full menu items including user dropdown for desktop
  const menuItems = [
    ...baseMenuItems,
    {
      key: "user",
      label: (
        <Dropdown menu={{ items: userMenuItems }} trigger={["hover", "click"]}>
          <Button type="text" icon={<UserOutlined />} className="user-icon" />
        </Dropdown>
      ),
    },
  ];

  // Combine base and user menu items for determining the current key
  const allMenuItems = [...baseMenuItems, ...userMenuItems];

  // Determine the current selected key based on the pathname
  const currentKey =
    allMenuItems.find((item) => {
      const to = item.label?.props?.to; // Extract 'to' from Link
      return to === location.pathname;
    })?.key || "home"; // Default to "home" if no match

  return (
    <div className="navbar-container">
      <Link to="/" className="logo-container">
        <img src={logo} alt="Logo" className="logo-image" />
        <h2 className="logo-text">CricPulse<sup>™</sup></h2>
      </Link>

      {isMobile ? (
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={showDrawer}
          className="mobile-menu-button"
          aria-label="Open Menu"
        />
      ) : (
        <div className="desktop-menu-container">
          <Menu
            theme="dark"
            mode="horizontal"
            items={menuItems}
            className="desktop-menu"
            selectedKeys={[currentKey]} // Ensure active item is highlighted
          />
        </div>
      )}

      <Drawer
        title="Menu"
        placement="right"
        onClose={closeDrawer}
        open={visible}
      >
        <Menu
          theme="light"
          mode="vertical"
          items={[...baseMenuItems, ...userMenuItems]} // Include user menu items directly
          selectedKeys={[currentKey]} // Ensure active item is highlighted
        />
      </Drawer>
    </div>
  );
};

export default Navbar;