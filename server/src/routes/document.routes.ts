import { Router } from 'express';
import { getDocuments, uploadDocument, updateDocument, deleteDocument } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/roleGuard';
import { uploadDocument as uploadMiddleware } from '../middleware/upload';

const router = Router();

router.get('/:id/documents', authenticate, requirePermission('document:read'), getDocuments);
router.post('/:id/documents', authenticate, requirePermission('document:write'), uploadMiddleware.single('file'), uploadDocument);
router.put('/:id/documents/:did', authenticate, requirePermission('document:write'), updateDocument);
router.delete('/:id/documents/:did', authenticate, requirePermission('document:write'), deleteDocument);

export default router;
