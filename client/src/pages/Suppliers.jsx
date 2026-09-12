import { useEffect, useState } from "react";
import {
    Layout,
    Menu,
    Card,
    Button,
    Form,
    Input,
    Modal,
    Popconfirm,
    Space,
    Table,
    Tag,
    Typography,
    message,
} from "antd";

import {
    DashboardOutlined,
    AppstoreOutlined,
    LogoutOutlined,
    ShoppingOutlined,
    DatabaseOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";

import api from "../api";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function Suppliers({
    onDashboard,
    onProducts,
    onReports,
    onLogout,
}) {
    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form] = Form.useForm();

    const loadSuppliers = async () => {
        try {
            setLoading(true);

            const response =
                await api.get("/suppliers");

            const formattedSuppliers =
                response.data.map(
                    (supplier) => ({
                        id: supplier.Id,
                        name: supplier.Name,
                        contactPerson:
                            supplier.ContactPerson,
                        phone: supplier.Phone,
                        email: supplier.Email,
                        address: supplier.Address,
                        createdAt:
                            supplier.CreatedAt,
                    })
                );

            setSuppliers(
                formattedSuppliers
            );

            setFilteredSuppliers(
                formattedSuppliers
            );
        } catch (error) {
            console.error(error);

            message.error(
                "Unable to load suppliers"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    const handleSearch = (value) => {
        setSearchText(value);

        const search =
            value.toLowerCase();

        const filtered =
            suppliers.filter(
                (supplier) =>
                    supplier.name
                        .toLowerCase()
                        .includes(search) ||
                    supplier.contactPerson
                        .toLowerCase()
                        .includes(search) ||
                    supplier.phone
                        .toLowerCase()
                        .includes(search) ||
                    supplier.email
                        .toLowerCase()
                        .includes(search)
            );

        setFilteredSuppliers(
            filtered
        );
    };

    const openAddModal = () => {
        setEditingSupplier(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (
        supplier
    ) => {
        setEditingSupplier(
            supplier
        );

        form.setFieldsValue({
            name: supplier.name,
            contactPerson:
                supplier.contactPerson,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
        });

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
        form.resetFields();
    };

    const saveSupplier = async (
        values
    ) => {
        try {
            if (editingSupplier) {
                await api.put(
                    `/suppliers/${editingSupplier.id}`,
                    values
                );

                message.success(
                    "Supplier updated successfully"
                );
            } else {
                await api.post(
                    "/suppliers",
                    values
                );

                message.success(
                    "Supplier added successfully"
                );
            }

            closeModal();
            loadSuppliers();
        } catch (error) {
            console.error(error);

            message.error(
                "Unable to save supplier"
            );
        }
    };

    const deleteSupplier = async (
        id
    ) => {
        try {
            await api.delete(
                `/suppliers/${id}`
            );

            message.success(
                "Supplier deleted successfully"
            );

            loadSuppliers();
        } catch (error) {
            console.error(error);

            message.error(
                "Unable to delete supplier"
            );
        }
    };

    const columns = [
        {
            title: "Supplier",
            dataIndex: "name",
            key: "name",
            render: (name) => (
                <Space
                    direction="vertical"
                    size={0}
                >
                    <Text strong>
                        {name}
                    </Text>

                    <Text type="secondary">
                        Supplier
                    </Text>
                </Space>
            ),
        },
        {
            title: "Contact Person",
            dataIndex:
                "contactPerson",
            key: "contactPerson",
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Status",
            key: "status",
            render: () => (
                <Tag color="green">
                    Active
                </Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 150,
            render: (
                _,
                record
            ) => (
                <Space>
                    <Button
                        type="text"
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
                        title="Delete this supplier?"
                        description="This action cannot be undone."
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{
                            danger: true,
                        }}
                        onConfirm={() =>
                            deleteSupplier(
                                record.id
                            )
                        }
                    >
                        <Button
                            type="text"
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
                        alignItems:
                            "center",
                        paddingLeft: 25,
                        fontSize: 22,
                        fontWeight:
                            "bold",
                    }}
                >
                    📦 My Inventory
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[
                        "suppliers",
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
                        padding:
                            "0 30px",
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "space-between",
                        borderBottom:
                            "1px solid #f0f0f0",
                    }}
                >
                    <div>
                        <Title
                            level={4}
                            style={{
                                margin: 0,
                            }}
                        >
                            Suppliers
                        </Title>
                    </div>

                    <Space>
                        <Button
                            icon={
                                <ReloadOutlined />
                            }
                            onClick={
                                loadSuppliers
                            }
                            loading={
                                loading
                            }
                        >
                            Refresh
                        </Button>

                        <Button
                            type="primary"
                            icon={
                                <PlusOutlined />
                            }
                            onClick={
                                openAddModal
                            }
                        >
                            Add Supplier
                        </Button>
                    </Space>
                </Header>

                {/* MAIN CONTENT */}
                <Content
                    style={{
                        padding: 30,
                        background:
                            "#f5f7fb",
                    }}
                >
                    <Title level={2}>
                        Suppliers
                    </Title>

                    <Text type="secondary">
                        Manage your
                        inventory
                        suppliers.
                    </Text>

                    {/* SUPPLIER TABLE */}
                    <Card
                        style={{
                            marginTop: 25,
                            borderRadius: 12,
                        }}
                    >
                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "center",
                                marginBottom:
                                    20,
                            }}
                        >
                            <div>
                                <Title
                                    level={4}
                                    style={{
                                        margin: 0,
                                    }}
                                >
                                    Supplier List
                                </Title>

                                <Text type="secondary">
                                    {
                                        filteredSuppliers.length
                                    }{" "}
                                    supplier
                                    {filteredSuppliers.length !==
                                        1
                                        ? "s"
                                        : ""}
                                </Text>
                            </div>

                            <Input
                                placeholder="Search suppliers..."
                                prefix={
                                    <SearchOutlined />
                                }
                                value={
                                    searchText
                                }
                                onChange={(
                                    e
                                ) =>
                                    handleSearch(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                allowClear
                                style={{
                                    width: 300,
                                }}
                            />
                        </div>

                        <Table
                            rowKey="id"
                            columns={
                                columns
                            }
                            dataSource={
                                filteredSuppliers
                            }
                            loading={
                                loading
                            }
                            pagination={{
                                pageSize: 8,
                                showSizeChanger:
                                    false,
                            }}
                        />
                    </Card>
                </Content>
            </Layout>

            {/* ADD / EDIT MODAL */}
            <Modal
                title={
                    editingSupplier
                        ? "Edit Supplier"
                        : "Add Supplier"
                }
                open={
                    isModalOpen
                }
                onCancel={
                    closeModal
                }
                footer={null}
                destroyOnHidden
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={
                        saveSupplier
                    }
                >
                    <Form.Item
                        label="Supplier Name"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter supplier name",
                            },
                        ]}
                    >
                        <Input placeholder="Enter supplier name" />
                    </Form.Item>

                    <Form.Item
                        label="Contact Person"
                        name="contactPerson"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter contact person",
                            },
                        ]}
                    >
                        <Input placeholder="Enter contact person" />
                    </Form.Item>

                    <Form.Item
                        label="Phone"
                        name="phone"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter phone number",
                            },
                        ]}
                    >
                        <Input placeholder="Enter phone number" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter email address",
                            },
                            {
                                type: "email",
                                message:
                                    "Please enter a valid email",
                            },
                        ]}
                    >
                        <Input placeholder="supplier@email.com" />
                    </Form.Item>

                    <Form.Item
                        label="Address"
                        name="address"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter supplier address",
                            },
                        ]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Enter supplier address"
                        />
                    </Form.Item>

                    <Form.Item
                        style={{
                            marginBottom: 0,
                        }}
                    >
                        <Space
                            style={{
                                width:
                                    "100%",
                                justifyContent:
                                    "flex-end",
                            }}
                        >
                            <Button
                                onClick={
                                    closeModal
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                type="primary"
                                htmlType="submit"
                            >
                                {editingSupplier
                                    ? "Update Supplier"
                                    : "Add Supplier"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
}