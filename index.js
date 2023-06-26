const express = require('express');
const mongodb = require('mongodb');
require("colors")
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.port || 10000;

const app = express();

app.use(cors());
app.use(express.json());

const mongoUrl = 'mongodb+srv://streamer-spotlight:hQD8gC78og2jZnmj@cluster0.tkhdgb3.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(mongoUrl);

async function dbConnect() {
 try {
  await client.connect();
  console.log("Database connected".yellow.italic)

 } catch (error) {
  console.log(error.name, error.message.red.bold);
  res.send({
   success: false,
   error: error.message
  });
 }
}
dbConnect();

const collection = client.db("streamer-spotlight").collection("streamers");

// POST /streamers
app.post('/streamers', async (req, res) => {
 try {
  const { name, platform, description } = req.body;

  const streamer = { name, platform, description, upvotes: 0, downvotes: 0 };
  await collection.insertOne(streamer);

  res.status(201).send('Streamer added successfully');

 } catch (error) {
  console.error('Error adding streamer:', error.red.bold);
  res.status(500).send('Server error');
 }
});

// GET /streamers
app.get('/streamers', async (req, res) => {
 try {

  const streamers = await collection.find().toArray();
  res.json(streamers);

 } catch (error) {
  console.error('Error fetching streamers:', error.red.bold);
  res.status(500).send('Server error');
 }
});

// GET /streamer/:streamerId
app.get('/streamers/:streamerId', async (req, res) => {
 try {
  const streamerId = req.params.streamerId;

  const query = { _id: new ObjectId(streamerId) }
  const streamer = await collection.findOne(query)

  if (!streamer) {
   res.status(404).send('Streamer not found');
   return;
  }

  res.send(streamer);
 } catch (error) {
  console.error('Error retrieving streamer:', error.red.bold);
  res.status(500).send('Server error');
 }
});

// PUT /streamers/:streamerId/vote
app.put('/streamers/:streamerId/vote', async (req, res) => {
 try {
  const streamerId = req.params.streamerId;
  const voteType = req.body.voteType;
  const update = {};

  if (voteType === 'upvote') {
   update.$inc = { upvotes: 1 };
  } else if (voteType === 'downvote') {
   update.$inc = { downvotes: 1 };
  } else {
   res.status(400).send('Invalid vote type');
   return;
  }

  await collection.updateOne({ _id: new mongodb.ObjectId(streamerId) }, update);

  res.status(200).send('Vote recorded');
 } catch (error) {
  console.error('Error voting for streamer:', error.red.bold);
  res.status(500).send('Server error');
 }
});

// Start the server
app.listen(port, () => {
 console.log(`Server is running on port ${port}`.cyan.bold);
});
