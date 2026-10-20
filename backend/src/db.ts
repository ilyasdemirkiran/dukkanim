import mongoose from 'mongoose';

export async function connectDB() {
  const host = process.env.MONGO_HOST || 'mongodb';
  const port = process.env.MONGO_PORT || '27888';
  const user = process.env.MONGO_ROOT_USER;
  const pass = process.env.MONGO_ROOT_PASSWORD;
  const database = process.env.MONGO_DATABASE || 'dukkanim';

  let uri = process.env.MONGODB_URI;

  if (!uri && user && pass) {
    // Özel karakter içeren şifreler için URL encode
    const encodedUser = encodeURIComponent(user);
    const encodedPass = encodeURIComponent(pass);
    uri = `mongodb://${encodedUser}:${encodedPass}@${host}:${port}/${database}?authSource=admin`;
  } else if (!uri) {
    uri = `mongodb://${host}:${port}/${database}`;
  }

  try {
    await mongoose.connect(uri);
    console.log(`✅ Connected to MongoDB (${host}:${port}/${database})`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}
