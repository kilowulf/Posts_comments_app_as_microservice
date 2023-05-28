const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const PORT = 4005;

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Events data store structure
const events = [];

// Event Handler for incoming posts/comments
app.post("/events", (req, res) => {
  const event = req.body;

  // push event to store
  events.push(event);

  // Post service
  axios.post("http://posts-clusterip-srv:4000/events", event);
  // Comment service
  axios.post("http://comments-srv:4001/events", event);
  // Query service
  axios.post("http://query-srv:4002/events", event);
  // Moderation service
  axios.post("http://moderation-srv:4003/events", event);

  res.send({
    status: "OK"
  });
});

// Events endpoint: return all events
app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}...Event-Bus`);
});
