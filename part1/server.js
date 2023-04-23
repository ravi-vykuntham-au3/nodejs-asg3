const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const port = 3000;
const url = 'mongodb://localhost:27017';
const dbName = 'myDatabase';
const collectionName = 'myCollection';

// Define a route for generating and saving random integer values
app.post('/values', (req, res) => {
  // Generate random integer values for temperature and battery level
  const temperature = Math.floor(Math.random() * 50);
  const batteryLevel = Math.floor(Math.random() * 100);

  // Get the current timestamp
  const timestamp = new Date().toISOString();

  // Create a new JSON document with the random values and timestamp
  const document = {
    temperature,
    batteryLevel,
    timestamp,
  };

  // Connect to the MongoDB database and insert the document into the collection
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
    if (err) {
      console.error(err);
      res.status(500).send('Error connecting to database');
      return;
    }

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    collection.insertOne(document, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error saving document to database');
        return;
      }

      res.send('Document saved to database');
      client.close();
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
