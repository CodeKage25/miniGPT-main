const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    prompt: {
        type: String,
        required: true,
    },
    response: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

Schema.index({ timestamp: -1 });

const Prompt = mongoose.model("Prompt", Schema);

module.exports = Prompt;
