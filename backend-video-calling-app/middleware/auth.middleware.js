import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
    try {
        let token;

        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "No token provided, authorization denied" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
