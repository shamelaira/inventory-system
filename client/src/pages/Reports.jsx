import { useEffect, useState } from "react";
import {
    Layout,
    Menu,
    Card,
    Button,
    Space,
    Table,
    Typography,
    Tag,
    message,
    Input,
    Select,
    Statistic,
    Row,
    Col,
} from "antd";

import {
    DashboardOutlined,
    ShoppingOutlined,
    DatabaseOutlined,
    AppstoreOutlined,
    LogoutOutlined,
    SearchOutlined,
    FileTextOutlined,
    WarningOutlined,
    InboxOutlined,
} from "@ant-design/icons";

import api from "../api";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function Reports({
    onDashboard,
    onProducts,
    onSuppliers,
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

    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    const [searchText, setSearchText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(false);

    const loadReport = async () => {
        try {
            setLoading(true);

            const [reportResponse, productsResponse] =
                await Promise.all([
                    api.get("/reports/inventory"),
                    api.get("/products"),
                ]);

            setReport(reportResponse.data);

            const products = productsResponse.data.map((product) => ({
                id: product.Id,
                name: product.Name,
                category: product.Category,
                quantity: product.Quantity,
                unitPrice: Number(product.UnitPrice),
                reorderLevel: product.ReorderLevel,
                stockValue:
                    Number(product.Quantity) *
                    Number(product.UnitPrice),
            }));

            setAllProducts(products);
            setFilteredProducts(products);
        } catch {
            message.error("Unable to load inventory report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    // SEARCH + FILTER
    useEffect(() => {
        let result = allProducts;

        if (searchText.trim() !== "") {
            result = result.filter((product) =>
                product.name
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
            );
        }

        if (categoryFilter !== "all") {
            result = result.filter(
                (product) =>
                    product.category === categoryFilter
            );
        }

        if (statusFilter !== "all") {
            result = result.filter((product) => {
                if (statusFilter === "out") {
                    return product.quantity === 0;
                }

                if (statusFilter === "low") {
                    return (
                        product.quantity > 0 &&
                        product.quantity <=
                        product.reorderLevel
                    );
                }

                if (statusFilter === "in") {
                    return (
                        product.quantity >
                        product.reorderLevel
                    );
                }

                return true;
            });
        }

        setFilteredProducts(result);
    }, [
        allProducts,
        searchText,
        categoryFilter,
        statusFilter,
    ]);

    const categories = [
        ...new Set(
            allProducts.map(
                (product) => product.category
            )
        ),
    ];

    const getStatus = (
        quantity,
        reorderLevel
    ) => {
        if (quantity === 0) {
            return (
                <Tag color="red">
                    Out of Stock
                </Tag>
            );
        }

        if (quantity <= reorderLevel) {
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

    const columns = [
        {
            title: "Product",
            dataIndex: "name",
            key: "name",
            render: (name) => (
                <Text strong>{name}</Text>
            ),
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Unit Price",
            dataIndex: "unitPrice",
            key: "unitPrice",
            render: (price) =>
                `₱${price.toLocaleString(
                    "en-PH",
                    {
                        minimumFractionDigits: 2,
                    }
                )}`,
        },
        {
            title: "Stock Value",
            dataIndex: "stockValue",
            key: "stockValue",
            render: (value) =>
                `₱${value.toLocaleString(
                    "en-PH",
                    {
                        minimumFractionDigits: 2,
                    }
                )}`,
        },
        {
            title: "Reorder Level",
            dataIndex: "reorderLevel",
            key: "reorderLevel",
        },
        {
            title: "Status",
            key: "status",
            render: (_, record) =>
                getStatus(
                    record.quantity,
                    record.reorderLevel
                ),
        },
    ];

    const totalProducts =
        report.summary.TotalProducts;

    const totalQuantity =
        report.summary.TotalQuantity;

    const inventoryValue =
        report.summary.TotalInventoryValue;

    const lowStockCount =
        allProducts.filter(
            (product) =>
                product.quantity > 0 &&
                product.quantity <=
                product.reorderLevel
        ).length;

    const outOfStockCount =
        allProducts.filter(
            (product) =>
                product.quantity === 0
        ).length;

    return (
        <Layout
            style={{
                minHeight: "100vh",
                width: "100%",
            }}
        >
            {/* =================================================
                FIXED SIDEBAR
            ================================================= */}
            <Sider
                width={230}
                style={{
                    background: "#ffffff",
                    borderRight:
                        "1px solid #f0f0f0",
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
                    selectedKeys={[
                        "reports",
                    ]}
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
                            onClick:
                                onDashboard,
                        },
                        {
                            key: "products",
                            icon: (
                                <ShoppingOutlined />
                            ),
                            label: "Products",
                            onClick:
                                onProducts,
                        },
                        {
                            key: "suppliers",
                            icon: (
                                <DatabaseOutlined />
                            ),
                            label: "Suppliers",
                            onClick:
                                onSuppliers,
                        },
                        {
                            key: "reports",
                            icon: (
                                <AppstoreOutlined />
                            ),
                            label: "Reports",
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
                            onClick:
                                onLogout,
                        },
                    ]}
                />
            </Sider>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}
            <Layout
                style={{
                    marginLeft: 230,
                    minHeight: "100vh",
                    width:
                        "calc(100% - 230px)",
                }}
            >
                {/* HEADER */}
                <Header
                    style={{
                        background:
                            "#ffffff",
                        padding: "0 30px",
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "space-between",
                        borderBottom:
                            "1px solid #f0f0f0",
                    }}
                >
                    <Title
                        level={4}
                        style={{
                            margin: 0,
                        }}
                    >
                        Reports
                    </Title>

                    <Button
                        onClick={
                            loadReport
                        }
                        loading={loading}
                    >
                        Refresh Report
                    </Button>
                </Header>

                {/* CONTENT */}
                <Content
                    style={{
                        padding: 30,
                        background:
                            "#f5f7fb",
                    }}
                >
                    <div
                        style={{
                            marginBottom: 25,
                        }}
                    >
                        <Title
                            level={2}
                            style={{
                                marginBottom: 5,
                            }}
                        >
                            Inventory Report
                        </Title>

                        <Text type="secondary">
                            Detailed overview
                            of products,
                            stock levels,
                            and inventory
                            value.
                        </Text>
                    </div>

                    {/* REPORT SUMMARY */}
                    <Row
                        gutter={[
                            20,
                            20,
                        ]}
                    >
                        <Col
                            xs={24}
                            sm={12}
                            lg={8}
                        >
                            <Card>
                                <Statistic
                                    title="Total Products"
                                    value={
                                        totalProducts
                                    }
                                    prefix={
                                        <FileTextOutlined />
                                    }
                                />
                            </Card>
                        </Col>

                        <Col
                            xs={24}
                            sm={12}
                            lg={8}
                        >
                            <Card>
                                <Statistic
                                    title="Total Stock Units"
                                    value={
                                        totalQuantity
                                    }
                                    prefix={
                                        <InboxOutlined />
                                    }
                                />
                            </Card>
                        </Col>

                        <Col
                            xs={24}
                            sm={12}
                            lg={8}
                        >
                            <Card>
                                <Statistic
                                    title="Total Inventory Value"
                                    value={
                                        inventoryValue
                                    }
                                    precision={2}
                                    prefix="₱"
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* STOCK ANALYSIS */}
                    <Card
                        title="Stock Analysis"
                        style={{
                            marginTop: 20,
                            borderRadius: 12,
                        }}
                    >
                        <Row
                            gutter={[
                                20,
                                20,
                            ]}
                        >
                            <Col
                                xs={24}
                                md={8}
                            >
                                <Card size="small">
                                    <Statistic
                                        title="In Stock"
                                        value={
                                            totalProducts -
                                            lowStockCount -
                                            outOfStockCount
                                        }
                                        valueStyle={{
                                            color:
                                                "#52c41a",
                                        }}
                                    />

                                    <Text type="secondary">
                                        Products
                                        with
                                        sufficient
                                        stock
                                    </Text>
                                </Card>
                            </Col>

                            <Col
                                xs={24}
                                md={8}
                            >
                                <Card size="small">
                                    <Statistic
                                        title="Low Stock"
                                        value={
                                            lowStockCount
                                        }
                                        prefix={
                                            <WarningOutlined />
                                        }
                                        valueStyle={{
                                            color:
                                                "#faad14",
                                        }}
                                    />

                                    <Text type="secondary">
                                        Products
                                        needing
                                        restock
                                    </Text>
                                </Card>
                            </Col>

                            <Col
                                xs={24}
                                md={8}
                            >
                                <Card size="small">
                                    <Statistic
                                        title="Out of Stock"
                                        value={
                                            outOfStockCount
                                        }
                                        prefix={
                                            <WarningOutlined />
                                        }
                                        valueStyle={{
                                            color:
                                                "#ff4d4f",
                                        }}
                                    />

                                    <Text type="secondary">
                                        Products
                                        with zero
                                        stock
                                    </Text>
                                </Card>
                            </Col>
                        </Row>
                    </Card>

                    {/* DETAILED REPORT */}
                    <Card
                        title="Detailed Inventory Report"
                        style={{
                            marginTop: 20,
                            borderRadius: 12,
                        }}
                    >
                        {/* FILTERS */}
                        <Space
                            wrap
                            style={{
                                width: "100%",
                                marginBottom: 20,
                            }}
                        >
                            <Input
                                placeholder="Search product..."
                                prefix={
                                    <SearchOutlined />
                                }
                                value={
                                    searchText
                                }
                                onChange={(
                                    e
                                ) =>
                                    setSearchText(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                allowClear
                                style={{
                                    width: 250,
                                }}
                            />

                            <Select
                                value={
                                    categoryFilter
                                }
                                onChange={
                                    setCategoryFilter
                                }
                                style={{
                                    width: 180,
                                }}
                                options={[
                                    {
                                        value: "all",
                                        label: "All Categories",
                                    },
                                    ...categories.map(
                                        (
                                            category
                                        ) => ({
                                            value:
                                                category,
                                            label:
                                                category,
                                        })
                                    ),
                                ]}
                            />

                            <Select
                                value={
                                    statusFilter
                                }
                                onChange={
                                    setStatusFilter
                                }
                                style={{
                                    width: 180,
                                }}
                                options={[
                                    {
                                        value: "all",
                                        label: "All Status",
                                    },
                                    {
                                        value: "in",
                                        label: "In Stock",
                                    },
                                    {
                                        value: "low",
                                        label: "Low Stock",
                                    },
                                    {
                                        value: "out",
                                        label: "Out of Stock",
                                    },
                                ]}
                            />

                            <Button
                                onClick={() => {
                                    setSearchText(
                                        ""
                                    );
                                    setCategoryFilter(
                                        "all"
                                    );
                                    setStatusFilter(
                                        "all"
                                    );
                                }}
                            >
                                Clear Filters
                            </Button>
                        </Space>

                        <Table
                            rowKey="id"
                            columns={
                                columns
                            }
                            dataSource={
                                filteredProducts
                            }
                            loading={
                                loading
                            }
                            pagination={{
                                pageSize: 8,
                                showSizeChanger:
                                    true,
                            }}
                            summary={(
                                pageData
                            ) => {
                                const pageValue =
                                    pageData.reduce(
                                        (
                                            total,
                                            product
                                        ) =>
                                            total +
                                            product.stockValue,
                                        0
                                    );

                                return (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell
                                            index={
                                                0
                                            }
                                        >
                                            <Text strong>
                                                Page Total
                                            </Text>
                                        </Table.Summary.Cell>

                                        <Table.Summary.Cell
                                            index={
                                                1
                                            }
                                        >
                                            -
                                        </Table.Summary.Cell>

                                        <Table.Summary.Cell
                                            index={
                                                2
                                            }
                                        >
                                            -
                                        </Table.Summary.Cell>

                                        <Table.Summary.Cell
                                            index={
                                                3
                                            }
                                        >
                                            -
                                        </Table.Summary.Cell>

                                        <Table.Summary.Cell
                                            index={
                                                4
                                            }
                                        >
                                            <Text strong>
                                                ₱
                                                {pageValue.toLocaleString(
                                                    "en-PH",
                                                    {
                                                        minimumFractionDigits: 2,
                                                    }
                                                )}
                                            </Text>
                                        </Table.Summary.Cell>

                                        <Table.Summary.Cell
                                            index={
                                                5
                                            }
                                        >
                                            -
                                        </Table.Summary.Cell>

                                        <Table.Summary.Cell
                                            index={
                                                6
                                            }
                                        >
                                            -
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                );
                            }}
                            locale={{
                                emptyText:
                                    "No products found",
                            }}
                        />
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
}