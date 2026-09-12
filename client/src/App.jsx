import { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Form,
  Input,
  message,
  Space,
  Typography,
} from "antd";

import {
  LockOutlined,
  UserOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  InboxOutlined,
} from "@ant-design/icons";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import Suppliers from "./pages/Suppliers";
import api from "./api";

const { Title, Text } = Typography;

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem("username");

    const savedToken =
      localStorage.getItem("token");

    return savedUser && savedToken
      ? savedUser
      : null;
  });

  const [page, setPage] = useState("dashboard");

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("darkMode") ===
      "true"
    );
  });

  const handleLogin = async (values) => {
    try {
      const response = await api.post(
        "/auth/login",
        values
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "username",
        response.data.username
      );

      setUser(response.data.username);
      setPage("dashboard");

      message.success("Login successful");
    } catch (error) {
      console.error(error);

      message.error(
        "Invalid username or password"
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    setUser(null);
    setPage("dashboard");

    message.success("Logged out");
  };

  const handleDarkMode = (checked) => {
    setDarkMode(checked);

    localStorage.setItem(
      "darkMode",
      checked
    );
  };


  if (!user) {
    return (
      <ConfigProvider>
        <div
          style={{
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
            background:
              "linear-gradient(135deg, #f0f5ff 0%, #f5f7fb 50%, #ffffff 100%)",
          }}
        >
          <Card
            styles={{
              body: {
                padding: 0,
              },
            }}
            style={{
              width: 900,
              maxWidth: "100%",
              overflow: "hidden",
              borderRadius: 16,
              border: "1px solid #e6eaf0",
              boxShadow:
                "0 20px 60px rgba(0, 0, 0, 0.10)",
            }}
          >
            <div
              style={{
                display: "flex",
                minHeight: 500,
              }}
            >
              {/* LEFT SIDE */}
              <div
                style={{
                  flex: 1,
                  padding: "55px 45px",
                  background:
                    "linear-gradient(145deg, #1677ff, #0958d9)",
                  color: "#fff",
                  display: "flex",
                  flexDirection:
                    "column",
                  justifyContent:
                    "center",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background:
                      "rgba(255,255,255,0.16)",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    marginBottom: 24,
                  }}
                >
                  <InboxOutlined
                    style={{
                      fontSize: 34,
                      color: "#fff",
                    }}
                  />
                </div>

                <Title
                  level={1}
                  style={{
                    color: "#fff",
                    margin: "0 0 12px",
                    fontSize: 36,
                  }}
                >
                  My Inventory System
                </Title>

                <Text
                  style={{
                    color:
                      "rgba(255,255,255,0.82)",
                    fontSize: 16,
                    lineHeight: 1.7,
                  }}
                >
                  Manage your products,
                  monitor stock levels,
                  and keep your
                  inventory organized
                  in one place.
                </Text>

                <div
                  style={{
                    marginTop: 35,
                  }}
                >
                  <div
                    style={{
                      marginBottom: 14,
                      color:
                        "rgba(255,255,255,0.9)",
                    }}
                  >
                    ✓ Product
                    management
                  </div>

                  <div
                    style={{
                      marginBottom: 14,
                      color:
                        "rgba(255,255,255,0.9)",
                    }}
                  >
                    ✓ Stock monitoring
                  </div>

                  <div
                    style={{
                      color:
                        "rgba(255,255,255,0.9)",
                    }}
                  >
                    ✓ Inventory
                    reports
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  padding: "55px 45px",
                  background: "#fff",
                  display: "flex",
                  flexDirection:
                    "column",
                  justifyContent:
                    "center",
                }}
              >
                <div
                  style={{
                    marginBottom: 30,
                  }}
                >
                  <Title
                    level={2}
                    style={{
                      marginBottom: 8,
                    }}
                  >
                    Welcome!
                  </Title>

                  <Text type="secondary">
                    Sign in to your
                    account to
                    continue.
                  </Text>
                </div>

                <Form
                  layout="vertical"
                  onFinish={
                    handleLogin
                  }
                  requiredMark={false}
                >
                  <Form.Item
                    label="Username"
                    name="username"
                    rules={[
                      {
                        required: true,
                        message:
                          "Enter your username",
                      },
                    ]}
                  >
                    <Input
                      prefix={
                        <UserOutlined />
                      }
                      placeholder="Enter your username"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message:
                          "Enter your password",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={
                        <LockOutlined />
                      }
                      placeholder="Enter your password"
                      size="large"
                      iconRender={(
                        visible
                      ) =>
                        visible ? (
                          <EyeTwoTone />
                        ) : (
                          <EyeInvisibleOutlined />
                        )
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    style={{
                      marginBottom: 24,
                    }}
                  >
                    <Checkbox>
                      Remember me
                    </Checkbox>
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    style={{
                      height: 46,
                      fontWeight: 600,
                      borderRadius: 8,
                    }}
                  >
                    Sign In
                  </Button>
                </Form>

                <div
                  style={{
                    textAlign:
                      "center",
                    marginTop: 28,
                  }}
                >
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    Inventory
                    Management
                    System
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </ConfigProvider>
    );
  }


  if (page === "products") {
    return (
      <Products
        onDashboard={() =>
          setPage("dashboard")
        }
        onSuppliers={() =>
          setPage("suppliers")
        }
        onReports={() =>
          setPage("reports")
        }
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={
          handleDarkMode
        }
      />
    );
  }

  if (page === "suppliers") {
    return (
      <Suppliers
        onDashboard={() =>
          setPage("dashboard")
        }
        onProducts={() =>
          setPage("products")
        }
        onReports={() =>
          setPage("reports")
        }
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={
          handleDarkMode
        }
      />
    );
  }

  if (page === "reports") {
    return (
      <Reports
        onDashboard={() =>
          setPage("dashboard")
        }
        onProducts={() =>
          setPage("products")
        }
        onSuppliers={() =>
          setPage("suppliers")
        }
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={
          handleDarkMode
        }
      />
    );
  }

  return (
    <Dashboard
      onProducts={() =>
        setPage("products")
      }
      onSuppliers={() =>
        setPage("suppliers")
      }
      onReports={() =>
        setPage("reports")
      }
      onLogout={handleLogout}
      darkMode={darkMode}
      onToggleDarkMode={
        handleDarkMode
      }
    />
  );
}