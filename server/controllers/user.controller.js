import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "all fields are required.",
      });
    }
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "user already exist with this email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to register!",
    });
  }
};
//--------------Login-Logic---------------------------------------------

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "all fields are required.",
      });
    }

    //email matching from db
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }
    console.log(user);
    //password match from db
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Incorrect email or password",
        });
      }
    }

    // calling jwt here
    generateToken(res, user, `Welcome Back ${user.name}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to Login!",
    });
  }
};
