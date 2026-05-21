const mongoose = require("mongoose");

const connectDB = async () => {
   try {
      const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

      if (!mongoUri) {
         throw new Error("MONGODB_URI is missing in .env");
      }

      await mongoose.connect(mongoUri);

      console.log("MongoDB connected");
   } catch (error) {
      console.log(error);
      process.exit(1);
   }
};

module.exports = connectDB;
