const jwt = require("jsonwebtoken");
require("dotenv").config();

function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ message: "Token required" });
    }

    const token = header.split(" ")[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = auth;