import { env } from './config/env';
import { connectDB } from './config/db';
import { app } from './app';

(async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`🚀 Server on http://localhost:${env.port}`);
  });
})();
