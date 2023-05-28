const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const PORT = 4003;

const app = express();
app.use(bodyParser.json());

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "CommentCreated") {
    // search comments for unapproved words
    const status = data.content.includes("orange") ? "rejected" : "approved";

    // return comment data back to event-bus service
    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentModerated",
      data: {
        id: data.id,
        postId: data.postId,
        status,
        content: data.content
      }
    });
  }
  res.send({});
});

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}...Moderation Service`);
});
