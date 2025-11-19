// const jwt = require("jsonwebtoken");

// const verifyToken = (req, res, next) => {
//   try {
//     // Check for token in Authorization header (Bearer <token>) or in cookies
//     const authHeader = req.headers.authorization;
//     const token =
//       (authHeader && authHeader.startsWith("Bearer ")
//         ? authHeader.split(" ")[1]
//         : null) || req.cookies?.token;

//         console.log("Token received:", token);
//     // If no token found
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Access denied. please login...!",
//       });
//     }

//     // Verify token using JWT secret
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Attach decoded user info (e.g. userId) to request object
//     req.user = decoded;

//     // Continue to next middleware or route
//     next();
//   } catch (err) {
//     console.error("Token verification error:", err.message);
//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token.",
//     });
//   }
// };

// module.exports = verifyToken;



const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    // ✅ 1️⃣ Check for token in Authorization header (Bearer <token>) or in cookies
    const authHeader = req.headers.authorization;
    const token =
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null) || req.cookies?.token;

    console.log("🟢 Token received:", token ? "Present" : "Missing");

    // ✅ 2️⃣ If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please login first.",
      });
    }

    // ✅ 3️⃣ Verify token using your JWT secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ 4️⃣ Attach decoded user info to request object
    req.user = decoded; // e.g. { userId, email }

    // ✅ 5️⃣ Continue to next middleware or route
    next();
  } catch (err) {
    console.error("❌ Token verification error:", err.message);

    return res.status(401).json({
      success: false,
      message:
        err.name === "TokenExpiredError"
          ? "Session expired. Please login again."
          : "Invalid or expired token.",
    });
  }
};

module.exports = verifyToken;
