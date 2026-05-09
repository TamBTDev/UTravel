import 'dotenv/config';
import app from './app';
import { initializeJobs } from './jobs';

const PORT = process.env.PORT || 3000;

// Initialize background jobs
initializeJobs();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
