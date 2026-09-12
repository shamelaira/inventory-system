import { useEffect, useMemo, useState } from "react";
import {
    Layout,
    Menu,
    Card,
    Row,
    Col,
    Statistic,
    Button,
    Table,
    Tag,
    Typography,
    message,
    Space,
} from "antd";

import {
    DashboardOutlined,
    ShoppingOutlined,
    DatabaseOutlined,
    AppstoreOutlined,
    LogoutOutlined,
    PlusOutlined,
    ArrowRightOutlined,
    WarningOutlined,
    InboxOutlined,
} from "@ant-design/icons";

import api from "../api";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function Dashboard({
    onProducts,
    onSuppliers,
    onReports,
    onLogout,
}) {
    const [report, setReport] = useState({
        summary: {
            TotalProducts: 0,
            TotalQuantity: 0,
            TotalInventoryValue: 0,
        },
        lowStockProducts: [],
    });

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const [reportResponse, productsResponse] =
                await Promise.all([
                    api.get("/reports/inventory"),
                    api.get("/products"),
                ]);

            setReport({
                summary: reportResponse.data.summary || {
                    TotalProducts: 0,
                    TotalQuantity: 0,
                    TotalInventoryValue: 0,
                },
                lowStockProducts:
                    reportResponse.data.lowStockProducts || [],
            });

            setProducts(productsResponse.data || []);
        } catch (error) {
            console.error(error);
            message.error("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const totalProducts =
        Number(report.summary.TotalProducts) || 0;

    const totalQuantity =
        Number(report.summary.TotalQuantity) || 0;

    const inventoryValue =
        Number(report.summary.TotalInventoryValue) || 0;

    const lowStockProducts =
        report.lowStockProducts || [];

    const lowStockCount = lowStockProducts.filter(
        (product) => Number(product.Quantity) > 0
    ).length;

    const outOfStockCount = lowStockProducts.filter(
        (product) => Number(product.Quantity) === 0
    ).length;

    const inStockCount = Math.max(
        totalProducts -
        lowStockCount -
        outOfStockCount,
        0
    );

    const inStockPercent =
        totalProducts > 0
            ? Math.round(
                (inStockCount / totalProducts) * 100
            )
            : 0;

    const lowStockPercent =
        totalProducts > 0
            ? Math.round(
                (lowStockCount / totalProducts) * 100
            )
            : 0;

    const outOfStockPercent =
        totalProducts > 0
            ? Math.round(
                (outOfStockCount / totalProducts) * 100
            )
            : 0;

    /*
    =========================================================
    STOCK BY CATEGORY
    =========================================================
    */

    const categoryData = useMemo(() => {
        const categories = {};

        products.forEach((product) => {
            const category =
                product.Category || "Uncategorized";

            const quantity =
                Number(product.Quantity) || 0;

            if (!categories[category]) {
                categories[category] = 0;
            }

            categories[category] += quantity;
        });

        return Object.entries(categories)
            .map(([category, quantity]) => ({
                category,
                quantity,
            }))
            .sort((a, b) => b.quantity - a.quantity);
    }, [products]);

    const maxCategoryQuantity =
        categoryData.length > 0
            ? Math.max(
                ...categoryData.map(
                    (item) => item.quantity
                )
            )
            : 0;

    /*
    =========================================================
    INVENTORY STATUS
    =========================================================
    */

    const pieTotal =
        inStockCount +
        lowStockCount +
        outOfStockCount;

    const inStockDegree =
        pieTotal > 0
            ? (inStockCount / pieTotal) * 360
            : 0;

    const lowStockDegree =
        pieTotal > 0
            ? (lowStockCount / pieTotal) * 360
            : 0;

    const pieBackground =
        pieTotal > 0
            ? `conic-gradient(
                #52c41a 0deg ${inStockDegree}deg,
                #faad14 ${inStockDegree}deg ${inStockDegree + lowStockDegree
            }deg,
                #ff4d4f ${inStockDegree + lowStockDegree
            }deg 360deg
            )`
            : "#f0f0f0";

    /*
    =========================================================
    STATUS FUNCTION
    =========================================================
    */

    const getStatus = (
        quantity,
        reorderLevel
    ) => {
        const qty = Number(quantity);
        const reorder = Number(reorderLevel);

        if (qty === 0) {
            return (
                <Tag color="red">
                    Out of Stock
                </Tag>
            );
        }

        if (qty <= reorder) {
            return (
                <Tag color="orange">
                    Low Stock
                </Tag>
            );
        }

        return (
            <Tag color="green">
                In Stock
            </Tag>
        );
    };

    /*
    =========================================================
    LOW STOCK TABLE
    =========================================================
    */

    const lowStockColumns = [
        {
            title: "Product",
            dataIndex: "Name",
            key: "Name",
        },
        {
            title: "Stock",
            dataIndex: "Quantity",
            key: "Quantity",
            render: (quantity) => (
                <Text strong>{quantity}</Text>
            ),
        },
        {
            title: "Reorder Level",
            dataIndex: "ReorderLevel",
            key: "ReorderLevel",
        },
        {
            title: "Status",
            key: "Status",
            render: (_, record) =>
                getStatus(
                    record.Quantity,
                    record.ReorderLevel
                ),
        },
    ];

    /*
    =========================================================
    RECENT PRODUCTS
    =========================================================
    */

    const recentProducts = [...products]
        .reverse()
        .slice(0, 5);

    const recentProductColumns = [
        {
            title: "Product",
            dataIndex: "Name",
            key: "Name",
        },
        {
            title: "Category",
            dataIndex: "Category",
            key: "Category",
        },
        {
            title: "Quantity",
            dataIndex: "Quantity",
            key: "Quantity",
            render: (quantity) => (
                <Text strong>{quantity}</Text>
            ),
        },
        {
            title: "Status",
            key: "Status",
            render: (_, record) =>
                getStatus(
                    record.Quantity,
                    record.ReorderLevel
                ),
        },
    ];

    return (
        <Layout
            style={{
                minHeight: "100vh",
                width: "100%",
            }}
        >
            {/* SIDEBAR */}
            <Sider
                width={230}
                breakpoint="lg"
                collapsedWidth="0"
                style={{
                    background: "#ffffff",
                    borderRight: "1px solid #f0f0f0",

                    /* FIXED SIDEBAR */
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    height: "100vh",
                    overflow: "auto",
                    zIndex: 1000,
                }}
            >
                <div
                    style={{
                        height: 70,
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 25,
                        fontSize: 22,
                        fontWeight: "bold",
                    }}
                >
                    📦 My Inventory
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={["dashboard"]}
                    style={{
                        borderRight: 0,
                    }}
                    items={[
                        {
                            key: "dashboard",
                            icon: (
                                <DashboardOutlined />
                            ),
                            label: "Dashboard",
                        },
                        {
                            key: "products",
                            icon: (
                                <ShoppingOutlined />
                            ),
                            label: "Products",
                            onClick: onProducts,
                        },
                        {
                            key: "suppliers",
                            icon: (
                                <DatabaseOutlined />
                            ),
                            label: "Suppliers",
                            onClick: onSuppliers,
                        },
                        {
                            key: "reports",
                            icon: (
                                <AppstoreOutlined />
                            ),
                            label: "Reports",
                            onClick: onReports,
                        },
                        {
                            type: "divider",
                        },
                        {
                            key: "logout",
                            icon: (
                                <LogoutOutlined />
                            ),
                            label: "Logout",
                            danger: true,
                            onClick: onLogout,
                        },
                    ]}
                />
            </Sider>

            {/* MAIN CONTENT */}
            <Layout
                style={{
                    width: "calc(100% - 230px)",
                    minWidth: 0,
                    marginLeft: 230,
                }}
            >
                {/* HEADER */}
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        borderBottom:
                            "1px solid #f0f0f0",
                    }}
                >
                    <Title
                        level={4}
                        style={{ margin: 0 }}
                    >
                        Dashboard
                    </Title>

                    <Button
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={onProducts}
                    >
                        Add Product
                    </Button>
                </Header>

                <Content
                    style={{
                        padding: 24,
                        background: "#f5f7fb",
                        minHeight:
                            "calc(100vh - 64px)",
                        width: "100%",
                    }}
                >
                    {/* PAGE TITLE */}
                    <div
                        style={{
                            marginBottom: 24,
                        }}
                    >
                        <Title
                            level={2}
                            style={{
                                marginBottom: 4,
                            }}
                        >
                            Inventory Overview
                        </Title>

                        <Text type="secondary">
                            Here's what's happening
                            with your PC shop
                            inventory.
                        </Text>
                    </div>

                    {/* SUMMARY CARDS */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Total Products"
                                    value={
                                        totalProducts
                                    }
                                    prefix={
                                        <ShoppingOutlined />
                                    }
                                    loading={loading}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Total Stock"
                                    value={
                                        totalQuantity
                                    }
                                    prefix={
                                        <InboxOutlined />
                                    }
                                    loading={loading}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Inventory Value"
                                    value={
                                        inventoryValue
                                    }
                                    prefix="₱"
                                    precision={2}
                                    loading={loading}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Low Stock Items"
                                    value={
                                        lowStockCount
                                    }
                                    prefix={
                                        <WarningOutlined />
                                    }
                                    loading={loading}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* GRAPHS */}
                    <Row
                        gutter={[16, 16]}
                        style={{
                            marginTop: 16,
                        }}
                    >
                        {/* STOCK BY CATEGORY */}
                        <Col xs={24} lg={15}>
                            <Card
                                title="Stock by Category"
                                loading={loading}
                            >
                                {categoryData.length ===
                                    0 ? (
                                    <div
                                        style={{
                                            height: 280,
                                            display:
                                                "flex",
                                            justifyContent:
                                                "center",
                                            alignItems:
                                                "center",
                                            color: "#999",
                                        }}
                                    >
                                        No product data
                                        available
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            padding:
                                                "10px 0",
                                        }}
                                    >
                                        {categoryData.map(
                                            (item) => {
                                                const percentage =
                                                    maxCategoryQuantity >
                                                        0
                                                        ? (item.quantity /
                                                            maxCategoryQuantity) *
                                                        100
                                                        : 0;

                                                return (
                                                    <div
                                                        key={
                                                            item.category
                                                        }
                                                        style={{
                                                            marginBottom:
                                                                18,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                justifyContent:
                                                                    "space-between",
                                                                marginBottom:
                                                                    6,
                                                            }}
                                                        >
                                                            <Text strong>
                                                                {
                                                                    item.category
                                                                }
                                                            </Text>

                                                            <Text>
                                                                {
                                                                    item.quantity
                                                                }{" "}
                                                                units
                                                            </Text>
                                                        </div>

                                                        <div
                                                            style={{
                                                                width: "100%",
                                                                height: 18,
                                                                background:
                                                                    "#f0f0f0",
                                                                borderRadius:
                                                                    10,
                                                                overflow:
                                                                    "hidden",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                    height: "100%",
                                                                    background:
                                                                        "#1677ff",
                                                                    borderRadius:
                                                                        10,
                                                                    transition:
                                                                        "width 0.4s ease",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            </Card>
                        </Col>

                        {/* INVENTORY STATUS PIE */}
                        <Col xs={24} lg={9}>
                            <Card
                                title="Inventory Status"
                                loading={loading}
                            >
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "center",
                                        alignItems:
                                            "center",
                                        padding:
                                            "15px 0 20px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 190,
                                            height: 190,
                                            borderRadius:
                                                "50%",
                                            background:
                                                pieBackground,
                                            display:
                                                "flex",
                                            justifyContent:
                                                "center",
                                            alignItems:
                                                "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 110,
                                                height: 110,
                                                borderRadius:
                                                    "50%",
                                                background:
                                                    "#fff",
                                                display:
                                                    "flex",
                                                flexDirection:
                                                    "column",
                                                justifyContent:
                                                    "center",
                                                alignItems:
                                                    "center",
                                            }}
                                        >
                                            <Text type="secondary">
                                                Products
                                            </Text>

                                            <Text
                                                strong
                                                style={{
                                                    fontSize: 28,
                                                }}
                                            >
                                                {
                                                    totalProducts
                                                }
                                            </Text>
                                        </div>
                                    </div>
                                </div>

                                <Space
                                    direction="vertical"
                                    style={{
                                        width: "100%",
                                    }}
                                    size={10}
                                >
                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                        }}
                                    >
                                        <Space>
                                            <span
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius:
                                                        "50%",
                                                    background:
                                                        "#52c41a",
                                                    display:
                                                        "inline-block",
                                                }}
                                            />

                                            <Text>
                                                In Stock
                                            </Text>
                                        </Space>

                                        <Text strong>
                                            {
                                                inStockCount
                                            }{" "}
                                            (
                                            {
                                                inStockPercent
                                            }
                                            %)
                                        </Text>
                                    </div>

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                        }}
                                    >
                                        <Space>
                                            <span
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius:
                                                        "50%",
                                                    background:
                                                        "#faad14",
                                                    display:
                                                        "inline-block",
                                                }}
                                            />

                                            <Text>
                                                Low Stock
                                            </Text>
                                        </Space>

                                        <Text strong>
                                            {
                                                lowStockCount
                                            }{" "}
                                            (
                                            {
                                                lowStockPercent
                                            }
                                            %)
                                        </Text>
                                    </div>

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                        }}
                                    >
                                        <Space>
                                            <span
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius:
                                                        "50%",
                                                    background:
                                                        "#ff4d4f",
                                                    display:
                                                        "inline-block",
                                                }}
                                            />

                                            <Text>
                                                Out of
                                                Stock
                                            </Text>
                                        </Space>

                                        <Text strong>
                                            {
                                                outOfStockCount
                                            }{" "}
                                            (
                                            {
                                                outOfStockPercent
                                            }
                                            %)
                                        </Text>
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                    </Row>

                    {/* RECENT PRODUCTS */}
                    <Card
                        title="Recent Products"
                        extra={
                            <Button
                                type="link"
                                onClick={onProducts}
                            >
                                View All{" "}
                                <ArrowRightOutlined />
                            </Button>
                        }
                        style={{
                            marginTop: 16,
                        }}
                        loading={loading}
                    >
                        <Table
                            columns={recentProductColumns}
                            dataSource={recentProducts.map(
                                (product, index) => ({
                                    ...product,
                                    key:
                                        product.Id ||
                                        index,
                                })
                            )}
                            pagination={false}
                            size="middle"
                            rowClassName={() =>
                                "inventory-table-row"
                            }
                            locale={{
                                emptyText:
                                    "No products available",
                            }}
                        />
                    </Card>

                    {/* LOW STOCK ALERTS */}
                    <Card
                        title={
                            <span>
                                <WarningOutlined
                                    style={{
                                        marginRight: 8,
                                    }}
                                />
                                Low Stock Alerts
                            </span>
                        }
                        extra={
                            <Button
                                type="link"
                                onClick={onProducts}
                            >
                                View All Products{" "}
                                <ArrowRightOutlined />
                            </Button>
                        }
                        style={{
                            marginTop: 16,
                        }}
                    >
                        <Table
                            columns={lowStockColumns}
                            dataSource={lowStockProducts
                                .slice(0, 5)
                                .map(
                                    (
                                        product,
                                        index
                                    ) => ({
                                        ...product,
                                        key:
                                            product.Id ||
                                            index,
                                    })
                                )}
                            pagination={false}
                            loading={loading}
                            size="middle"
                            rowClassName={() =>
                                "inventory-table-row"
                            }
                            locale={{
                                emptyText:
                                    "No low stock products",
                            }}
                        />
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
}