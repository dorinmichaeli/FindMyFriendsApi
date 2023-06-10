import mongoose from 'mongoose';

export async function connectToMongo(config) {
  // Set global defaults.
  // It's a bit ugly to do it here, but it seems to be the only fitting place.
  // See: https://mongoosejs.com/docs/guide.html#strict
  mongoose.set('strict', true);
  mongoose.set('strictPopulate', true);
  mongoose.set('strictQuery', true);

  // Construct a MongoDB URI and options object.
  const host = encodeURIComponent(config.mongo.host);
  const port = encodeURIComponent(config.mongo.port);
  const database = encodeURIComponent(config.mongo.database);
  const uri = `mongodb://${host}:${port}/${database}`;
  const options = {
    authSource: 'admin',
    user: config.mongo.username,
    pass: config.mongo.password,
    serverSelectionTimeoutMS: 3000,
  };
  // Create a new MongoClient and wait for it to connect.
  const client = await mongoose.connect(uri, options);
  // Return a new client.
  return client;
}
