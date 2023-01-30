const mongoose = require("mongoose")
const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    UserName: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
    }
});
module.exports = userSchema;