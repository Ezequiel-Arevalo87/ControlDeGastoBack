import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';
import expensesRoutes from './routes/expenses.routes';
import categoriesRoutes from './routes/categories.routes';
import incomeRoutes from './routes/income.routes';
import reportsRoutes from './routes/report.routes';
import uiRoutes  from './routes/ui.routes';
import savingsRoutes from './routes/savings.routes';
import { errorHandler } from './middleware/error.middleware';

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', healthRoutes);

app.use('/api/categories', categoriesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/reports', reportsRoutes); // 👈 MONTA AQUÍ LOS REPORTES
app.use('/api/ui', uiRoutes);
app.use('/api/savings', savingsRoutes);

app.use(errorHandler);
