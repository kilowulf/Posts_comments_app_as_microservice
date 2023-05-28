const express = require("express");
const { randomBytes } = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const PORT = 4001;

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

// Retrieve posts
app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// Generate post data objects from posts
app.post("/posts/:id/comments", async (req, res) => {
  // create id for comment
  const commentID = randomBytes(4).toString("hex");
  // destructure content from body
  const { content } = req.body;

  // either assign comments from array or empty array
  const comments = commentsByPostId[req.params.id] || [];
  // push comment to comments array
  comments.push({ id: commentID, content, status: "pending" });

  commentsByPostId[req.params.id] = comments;

  // emit event to event bus
  await axios.post("http://event-bus-srv:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentID,
      content,
      postId: req.params.id,
      status: "pending"
    }
  });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  // Note Event action
  console.log("Received Event", req.body.type);
  // destructure event type
  const { type, data } = req.body;

  // check comment type for moderation
  if (type === "CommentModerated") {
    // get post comments
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId];
    // find comment to update
    const comment = comments.find(comment => {
      return comment.id === id;
    });
    // update comment status
    comment.status = status;

    // emit event to event bus
    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        status,
        postId,
        content
      }
    });
  }

  res.send({});
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}...Comments Service`);
});
