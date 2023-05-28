const express = require("express");
const { randomBytes } = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

// Docker image: 582da0b232aa91f6922ab91c7511df4c9fd70389d0ce4464e076c7c613abd16a

const PORT = 4000;
const posts = {};

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Retrieve posts
app.get("/posts", (req, res) => {
  res.send(posts);
});

// Generate post data objects from posts
app.post("/posts/create", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;

  posts[id] = { id, title };

  // emit event to event bus
  await axios.post("http://event-bus-srv:4005/events", {
    type: "PostCreated",
    data: {
      id,
      title
    }
  });

  res.status(201).send(posts[id]);
});

app.post("/events", (req, res) => {
  console.log("Received Event", req.body.type);

  res.send({});
});

app.listen(PORT, () => {
  console.log("V55");
  console.log(`listening on ${PORT}...Post Service`);
});

// npm run dev
