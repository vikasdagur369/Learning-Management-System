import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies.token;
    //console.log("Received Token:", token); // Log token to debug
    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.id = decode.userId;
    next();
  } catch (error) {
    console.log(error); // Log the error
    return res.status(401).json({
      message: "Invalid token or authentication error",
      success: false,
    });
  }
};
export default isAuthenticated;
