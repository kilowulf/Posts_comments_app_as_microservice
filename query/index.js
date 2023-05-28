const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const PORT = 4002;

const app = express();

app.use(bodyParser.json());
app.use(cors());

// container data structure for posts
const posts = {};

// handler function for determining post/comment status
const handleEventStatus = (type, data) => {
  // Check types
  if (type === "PostCreated") {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    post.comments.push({
      id,
      content,
      status
    });
  }

  if (type === "CommentUpdated") {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    const comment = post.comments.find(comment => {
      return comment.id === id;
    });

    // re-assign potentially updated properties
    comment.status = status;
    comment.content = content;
  }
};

app.get("/posts", (req, res) => {
  res.send(posts);
});

// endpoint request to check post comment types
// perform decision logic  based on type
app.post("/events", (req, res) => {
  // destructure for type an data
  const { type, data } = req.body;

  handleEventStatus(type, data);

  res.send({});
});

app.listen(PORT, async () => {
  console.log(`Listening on port: ${PORT}...Query Service`);

  // log events to console
  const res = await axios.get("http://event-bus-srv:4005/events");
  for (let event of res.data) {
    console.log("Processing event: ", event.type);
    handleEventStatus(event.type, event.data);
  }
});
