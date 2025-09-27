import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';

type Role = 'USER' | 'ADMIN';
type MenuItem = {
  key: string;
  label: string;
  icon?: string;      // nombre del ícono (MUI) para mapear en el front
  path?: string;      // ruta a navegar
  roles?: Role[];     // quiénes lo ven
};

const router = Router();

function buildMenu(role: Role): MenuItem[] {
  // Menú plano para que funcione con tu SideMenu actual (sin recursividad)
  const all: MenuItem[] = [
    { key: 'expenses',      label: 'Gastos',               icon: 'ReceiptLong',  path: '/',                     roles: ['USER','ADMIN'] },
    { key: 'expense-new',   label: 'Nuevo gasto',          icon: 'AddCircle',    path: '/expenses/new',         roles: ['USER','ADMIN'] },
    { key: 'income',        label: 'Ingresos',             icon: 'Payments',     path: '/income',               roles: ['USER','ADMIN'] },
    { key: 'categories',    label: 'Categorías',           icon: 'Category',     path: '/categories',           roles: ['ADMIN'] }, // solo admin (ajusta si quieres)
    { key: 'rep-balance',   label: 'Balance mensual',      icon: 'Assessment',   path: '/reports/balance',      roles: ['USER','ADMIN'] },
    { key: 'rep-bycat',     label: 'Gastos por categoría', icon: 'PieChart',     path: '/reports/by-category',  roles: ['USER','ADMIN'] },
    { key: 'rep-summary',   label: 'Resumen de gastos',    icon: 'Summarize',    path: '/reports/summary',      roles: ['USER','ADMIN'] },
  ];
  return all.filter(m => !m.roles || m.roles.includes(role));
}

router.use(requireAuth);

// GET /api/ui/menu
router.get('/menu', (req: Request, res: Response) => {
  const role: Role = ((req as any).user?.role as Role) ?? 'USER'; // viene del JWT
  const items = buildMenu(role);
  res.json(items);
});

export default router;
