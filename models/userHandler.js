// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const express = require("express");
// const router = express.Router();
// const userSchema = require('./userSchema');
// const User = mongoose.model("User", userSchema);

// // signup
// router.post("/signup", async (req, res) => {
//     try {
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);
//         const newUser = new User({
//             name: req.body.name,
//             userName: req.body.username,
//             password: hashedPassword,
//         });
//         await newUser.save();
//         res.status(200).json({
//             message: "user was created successfully"
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "signup failed"
//         });
//     }
// });
