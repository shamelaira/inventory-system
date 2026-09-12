import { useEffect, useState } from "react";
import {
    Layout,
    Menu,
    Card,
    Button,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Space,
    Table,
    Typography,
    Tag,
    message,
    Select,
} from "antd";

import {
    DashboardOutlined,
    ShoppingOutlined,
    DatabaseOutlined,
    AppstoreOutlined,
    LogoutOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
} from "@ant-design/icons";

import api from "../api";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function Products({
    onDashboard,
    onSuppliers,
    onReports,
    onLogout,
}) {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const [form] = Form.useForm();

    const loadProducts = async () => {
        try {
            const response = await api.get("/products");

            const formattedProducts = response.data.map(
                (product) => ({
                    id: product.Id,
                    name: product.Name,
                    category: product.Category,
                    quantity: product.Quantity,
                    unitPrice: Number(
                        product.UnitPrice
                    ),
                    reorderLevel:
                        product.ReorderLevel,
                })
            );

            setProducts(formattedProducts);
            setFilteredProducts(
                formattedProducts
            );
        } catch {
            message.error(
                "Unable to load products"
            );
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // SEARCH + FILTER
    useEffect(() => {
        let result = products;

        if (searchText.trim() !== "") {
            result = result.filter(
                (product) =>
                    product.name
                        .toLowerCase()
                        .includes(
                            searchText.toLowerCase()
                        )
            );
        }

        if (categoryFilter !== "all") {
            result = result.filter(
                (product) =>
                    product.category ===
                    categoryFilter
            );
        }

        setFilteredProducts(result);
    }, [
        searchText,
        categoryFilter,
        products,
    ]);

    const categories = [
        ...new Set(
            products.map(
                (product) =>
                    product.category
            )
        ),
    ];

    const openAddModal = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        form.setFieldsValue(product);
        setIsModalOpen(true);
    };

    const saveProduct = async (values) => {
        try {
            if (editingProduct) {
                await api.put(
                    `/products/${editingProduct.id}`,
                    values
                );

                message.success(
                    "Product updated successfully"
                );
            } else {
                await api.post(
                    "/products",
                    values
                );

                message.success(
                    "Product created successfully"
                );
            }

            setIsModalOpen(false);
            form.resetFields();
            loadProducts();
        } catch {
            message.error(
                "Unable to save product"
            );
        }
    };

    const deleteProduct = async (id) => {
        try {
            await api.delete(
                `/products/${id}`
            );

            message.success(
                "Product deleted successfully"
            );

            loadProducts();
        } catch {
            message.error(
                "Unable to delete product"
            );
        }
    };

    const getStockStatus = (
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
            title: "Reorder Level",
            dataIndex: "reorderLevel",
            key: "reorderLevel",
        },
        {
            title: "Status",
            key: "status",
            render: (_, record) =>
                getStockStatus(
                    record.quantity,
                    record.reorderLevel
                ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={
                            <EditOutlined />
                        }
                        onClick={() =>
                            openEditModal(
                                record
                            )
                        }
                    >
                        Edit
                    </Button>

                    <Popconfirm
                        title="Delete this product?"
                        description="This action cannot be undone."
                        onConfirm={() =>
                            deleteProduct(
                                record.id
                            )
                        }
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            icon={
                                <DeleteOutlined />
                            }
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
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
                        "products",
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
                            onClick:
                                onReports,
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
                        Products
                    </Title>

                    <Button
                        type="primary"
                        icon={
                            <PlusOutlined />
                        }
                        onClick={
                            openAddModal
                        }
                    >
                        Add Product
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
                            Product Management
                        </Title>

                        <Text type="secondary">
                            Manage your
                            inventory
                            products and
                            stock levels.
                        </Text>
                    </div>

                    <Card
                        style={{
                            borderRadius: 12,
                        }}
                    >
                        {/* SEARCH + FILTER */}
                        <Space
                            wrap
                            style={{
                                marginBottom: 20,
                                width: "100%",
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
                                    width: 260,
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

                            <Button
                                onClick={
                                    loadProducts
                                }
                            >
                                Refresh
                            </Button>
                        </Space>

                        {/* TABLE */}
                        <Table
                            rowKey="id"
                            columns={
                                columns
                            }
                            dataSource={
                                filteredProducts
                            }
                            pagination={{
                                pageSize: 8,
                                showSizeChanger:
                                    true,
                            }}
                        />
                    </Card>
                </Content>
            </Layout>

            {/* ADD / EDIT MODAL */}
            <Modal
                title={
                    editingProduct
                        ? "Edit Product"
                        : "Add Product"
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(
                        false
                    );
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={
                        saveProduct
                    }
                >
                    <Form.Item
                        label="Product Name"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter the product name",
                            },
                        ]}
                    >
                        <Input placeholder="Enter product name" />
                    </Form.Item>

                    <Form.Item
                        label="Category"
                        name="category"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter the category",
                            },
                        ]}
                    >
                        <Input placeholder="Enter category" />
                    </Form.Item>

                    <Form.Item
                        label="Quantity"
                        name="quantity"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter the quantity",
                            },
                        ]}
                    >
                        <InputNumber
                            min={0}
                            style={{
                                width: "100%",
                            }}
                            placeholder="Enter quantity"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Unit Price"
                        name="unitPrice"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter the unit price",
                            },
                        ]}
                    >
                        <InputNumber
                            min={0}
                            precision={2}
                            style={{
                                width: "100%",
                            }}
                            placeholder="Enter unit price"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Reorder Level"
                        name="reorderLevel"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter the reorder level",
                            },
                        ]}
                    >
                        <InputNumber
                            min={0}
                            style={{
                                width: "100%",
                            }}
                            placeholder="Enter reorder level"
                        />
                    </Form.Item>

                    <Space
                        style={{
                            width: "100%",
                        }}
                    >
                        <Button
                            onClick={() => {
                                setIsModalOpen(
                                    false
                                );
                                form.resetFields();
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="primary"
                            htmlType="submit"
                        >
                            {editingProduct
                                ? "Update Product"
                                : "Save Product"}
                        </Button>
                    </Space>
                </Form>
            </Modal>
        </Layout>
    );
}