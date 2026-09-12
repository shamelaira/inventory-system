const express = require("express");
const cors = require("cors");
const sql = require("mssql/msnodesqlv8");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./auth");
require("dotenv").config();

const app = express();
const PORT = 5000;

const config = {
    server: ".\\SQLEXPRESS",
    database: "InventoryDB",
    driver: "ODBC Driver 18 for SQL Server",
    options: {
        trustedConnection: true,
        trustServerCertificate: true,
    },
};

app.use(cors());
app.use(express.json());

const poolPromise = sql.connect(config);

poolPromise
    .then(() => console.log("Connected to InventoryDB"))
    .catch((error) =>
        console.error("Database connection failed:", error)
    );

// =====================
// LOGIN
// =====================

app.post("/api/auth/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input("username", sql.NVarChar(50), username)
            .query(`
                SELECT Id, Username, PasswordHash
                FROM Users
                WHERE Username = @username
            `);

        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password",
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.PasswordHash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid username or password",
            });
        }

        const token = jwt.sign(
            {
                id: user.Id,
                username: user.Username,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h",
            }
        );

        res.json({
            token,
            username: user.Username,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to log in",
        });
    }
});

// =====================
// PRODUCTS
// =====================

// GET ALL PRODUCTS

app.get("/api/products", auth, async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                Id,
                Name,
                Category,
                Quantity,
                UnitPrice,
                ReorderLevel,
                CreatedAt
            FROM Products
            ORDER BY Id DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to retrieve products",
        });
    }
});

// CREATE PRODUCT

app.post("/api/products", auth, async (req, res) => {
    try {
        const {
            name,
            category,
            quantity,
            unitPrice,
            reorderLevel,
        } = req.body;

        const pool = await poolPromise;

        const result = await pool
            .request()
            .input("name", sql.NVarChar(100), name)
            .input("category", sql.NVarChar(100), category)
            .input("quantity", sql.Int, quantity)
            .input("unitPrice", sql.Decimal(10, 2), unitPrice)
            .input("reorderLevel", sql.Int, reorderLevel)
            .query(`
                INSERT INTO Products
                    (
                        Name,
                        Category,
                        Quantity,
                        UnitPrice,
                        ReorderLevel
                    )
                OUTPUT INSERTED.*
                VALUES
                    (
                        @name,
                        @category,
                        @quantity,
                        @unitPrice,
                        @reorderLevel
                    )
            `);

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to create product",
        });
    }
});

// UPDATE PRODUCT

app.put("/api/products/:id", auth, async (req, res) => {
    try {
        const {
            name,
            category,
            quantity,
            unitPrice,
            reorderLevel,
        } = req.body;

        const pool = await poolPromise;

        const result = await pool
            .request()
            .input("id", sql.Int, req.params.id)
            .input("name", sql.NVarChar(100), name)
            .input("category", sql.NVarChar(100), category)
            .input("quantity", sql.Int, quantity)
            .input("unitPrice", sql.Decimal(10, 2), unitPrice)
            .input("reorderLevel", sql.Int, reorderLevel)
            .query(`
                UPDATE Products
                SET
                    Name = @name,
                    Category = @category,
                    Quantity = @quantity,
                    UnitPrice = @unitPrice,
                    ReorderLevel = @reorderLevel
                OUTPUT INSERTED.*
                WHERE Id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to update product",
        });
    }
});

// DELETE PRODUCT

app.delete("/api/products/:id", auth, async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input("id", sql.Int, req.params.id)
            .query(`
                DELETE FROM Products
                OUTPUT DELETED.*
                WHERE Id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.json({
            message: "Product deleted successfully",
            product: result.recordset[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to delete product",
        });
    }
});

// =====================
// SUPPLIERS
// =====================

// GET ALL SUPPLIERS

app.get("/api/suppliers", auth, async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                Id,
                Name,
                ContactPerson,
                Phone,
                Email,
                Address,
                CreatedAt
            FROM Suppliers
            ORDER BY Id DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to retrieve suppliers",
        });
    }
});

// CREATE SUPPLIER

app.post("/api/suppliers", auth, async (req, res) => {
    try {
        const {
            name,
            contactPerson,
            phone,
            email,
            address,
        } = req.body;

        const pool = await poolPromise;

        const result = await pool
            .request()
            .input("name", sql.NVarChar(100), name)
            .input(
                "contactPerson",
                sql.NVarChar(100),
                contactPerson
            )
            .input("phone", sql.NVarChar(30), phone)
            .input("email", sql.NVarChar(100), email)
            .input("address", sql.NVarChar(255), address)
            .query(`
                INSERT INTO Suppliers
                    (
                        Name,
                        ContactPerson,
                        Phone,
                        Email,
                        Address
                    )
                OUTPUT INSERTED.*
                VALUES
                    (
                        @name,
                        @contactPerson,
                        @phone,
                        @email,
                        @address
                    )
            `);

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to create supplier",
        });
    }
});

// UPDATE SUPPLIER

app.put("/api/suppliers/:id", auth, async (req, res) => {
    try {
        const {
            name,
            contactPerson,
            phone,
            email,
            address,
        } = req.body;

        const pool = await poolPromise;

        const result = await pool
            .request()
            .input("id", sql.Int, req.params.id)
            .input("name", sql.NVarChar(100), name)
            .input(
                "contactPerson",
                sql.NVarChar(100),
                contactPerson
            )
            .input("phone", sql.NVarChar(30), phone)
            .input("email", sql.NVarChar(100), email)
            .input("address", sql.NVarChar(255), address)
            .query(`
                UPDATE Suppliers
                SET
                    Name = @name,
                    ContactPerson = @contactPerson,
                    Phone = @phone,
                    Email = @email,
                    Address = @address
                OUTPUT INSERTED.*
                WHERE Id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Supplier not found",
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to update supplier",
        });
    }
});

// DELETE SUPPLIER

app.delete("/api/suppliers/:id", auth, async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input("id", sql.Int, req.params.id)
            .query(`
                DELETE FROM Suppliers
                OUTPUT DELETED.*
                WHERE Id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Supplier not found",
            });
        }

        res.json({
            message: "Supplier deleted successfully",
            supplier: result.recordset[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to delete supplier",
        });
    }
});

// =====================
// INVENTORY REPORT
// =====================

app.get("/api/reports/inventory", auth, async (req, res) => {
    try {
        const pool = await poolPromise;

        const summaryResult = await pool.request().query(`
            SELECT
                COUNT(*) AS TotalProducts,
                ISNULL(SUM(Quantity), 0) AS TotalQuantity,
                ISNULL(
                    SUM(Quantity * UnitPrice),
                    0
                ) AS TotalInventoryValue
            FROM Products
        `);

        const lowStockResult = await pool.request().query(`
            SELECT
                Id,
                Name,
                Category,
                Quantity,
                ReorderLevel
            FROM Products
            WHERE Quantity <= ReorderLevel
            ORDER BY Quantity ASC
        `);

        res.json({
            summary: summaryResult.recordset[0],
            lowStockProducts: lowStockResult.recordset,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to generate report",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});