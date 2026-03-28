import { Router } from 'express';
import { getBudgets, createBudget, updateBudget, deleteBudget, getBudgetSummary } from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/roleGuard';

const router = Router();

router.get('/:id/budgets', authenticate, requirePermission('budget:read'), getBudgets);
router.post('/:id/budgets', authenticate, requirePermission('budget:write'), createBudget);
router.put('/:id/budgets/:bid', authenticate, requirePermission('budget:write'), updateBudget);
router.delete('/:id/budgets/:bid', authenticate, requirePermission('budget:write'), deleteBudget);
router.get('/:id/budgets/summary', authenticate, requirePermission('budget:read'), getBudgetSummary);

export default router;
