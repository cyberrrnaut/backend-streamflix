import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"; //calls mongoDB
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  console.log("email: ", email);
  console.log("password: ", password);

  // if (fullName === "") {
  //   throw new ApiError(400, "FullName is required");
  // }

  if (
    [fullName, email, username, password].some((field) => field?.trim() === " ")
  ) {
    throw new ApiError();
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with same email or username exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path; //optionally accessing  //not yet uploaded to cloudinary
  const coverImageLocalPath = req.file?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    //avatar is mandatory
    throw new ApiError(400, "Avatar file is required");
  }
  // upload on cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverIMage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }
  //create user
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverIMage: coverIMage?.url || "", //check for coverimage
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await user
    .findById(user._id)
    .select("-password -refreshToken"); //eliminating password and refreshtoken

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while regestering the user");
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
)
});

export { registerUser };
