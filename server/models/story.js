const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Story Model
const storySchema = new Schema({
    title: String,
    description: String,
    tags: String,
    subStory: [{
        ssid: String,
        order: Number,
        title: String,
        description: String,
        url: String,
        tags: String,
    }]
});

module.exports = mongoose.model("Story", storySchema);
