const { MongoClient } = require("mongodb");
const dbName = "abhishek_textile";

function createClient() {
  const client = new MongoClient(
    // REPLACE WITH YOUR CONNECTION STRING
    process.env.MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
  // mongodb+srv://atsolute:atsolute2022@cluster0.gzmju.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true
  // We add a usersCollection function to the client object,
  // this way neither login or signup need to know the name
  // of the database or the users collection.
  client.usersCollection = function () {
    return this.db(dbName).collection("users");
  };

  client.clientCollection = function () {
    return this.db(dbName).collection("discussion");
  };

  // client.db = function () {
  //   return this.db(dbName).collection("discussion");
  // };
  return client;
}

module.exports = { createClient };
