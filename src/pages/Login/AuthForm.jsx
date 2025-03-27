/* eslint-disable react/prop-types */
import { Form, Button, Card, Typography, Input } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const AuthForm = ({ isLogin, onSubmit, onToggle, onGuestLogin, error }) => {
  return (
    <Card
      style={{
        maxWidth: 400,
        width: "100%",
        margin: "0 auto",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <Title
        level={2}
        style={{
          textAlign: "center",
          marginBottom: "20px",
          fontSize: "24px",
          color: "#1a1a1a",
          fontWeight: 600,
        }}
      >
        {isLogin ? "Login" : "Sign Up"}
      </Title>

      {error && (
        <div
          style={{
            color: "#ff4d4f",
            textAlign: "center",
            marginBottom: "16px",
            fontSize: "14px",
            background: "#fff1f0",
            padding: "6px",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      <Form
        onFinish={onSubmit}
        layout="vertical"
        style={{ width: "100%" }}
      >
        {!isLogin && (
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter your username!" }]}
            style={{ marginBottom: "16px" }}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Enter your username"
              size="large"
              style={{ borderRadius: "4px" }}
            />
          </Form.Item>
        )}

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
          style={{ marginBottom: "16px" }}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Enter your email"
            size="large"
            style={{ borderRadius: "4px" }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please enter your password!" }]}
          style={{ marginBottom: "16px" }}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Enter your password"
            size="large"
            style={{ borderRadius: "4px" }}
          />
        </Form.Item>

        {!isLogin && (
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Passwords do not match!");
                },
              }),
            ]}
            style={{ marginBottom: "16px" }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Confirm your password"
              size="large"
              style={{ borderRadius: "4px" }}
            />
          </Form.Item>
        )}

        <Form.Item style={{ marginBottom: "12px" }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{
              color: "white",
              borderRadius: "4px",
              height: "40px",
              fontSize: "16px",
              background: "#1e295e",
              border: "none",
            }}
          >
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </Form.Item>

        {isLogin && (
          <Form.Item style={{ marginBottom: "12px" }}>
            <Button
              type="default"
              block
              size="large"
              onClick={onGuestLogin}
              style={{
                color: "white",
                borderRadius: "4px",
                height: "40px",
                fontSize: "16px",
                background: "#1e295e",
                border: "none",
              }}
            >
              Login as Guest
            </Button>
          </Form.Item>
        )}
      </Form>

      <div
        style={{
          textAlign: "center",
          marginTop: "12px",
        }}
      >
        <Text
          style={{
            color: "#595959",
            fontSize: "14px",
          }}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Button
            type="link"
            onClick={onToggle}
            style={{
              padding: 0,
              fontSize: "14px",
              color: "#1890ff",
            }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </Button>
        </Text>
      </div>
    </Card>
  );
};

export default AuthForm;