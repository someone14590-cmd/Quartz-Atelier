import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not set.");
}

const globalScope = globalThis;
let clientPromise = globalScope._mongoClientPromise;

if (!clientPromise) {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
  globalScope._mongoClientPromise = clientPromise;
}

export const getMongoDb = async () => {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB;
  return dbName ? client.db(dbName) : client.db();
};
