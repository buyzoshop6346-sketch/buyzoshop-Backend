import { Router } from 'express';
import { CategoryController } from './category.controller';
import { auth } from '../../middleware/auth';
import { Role } from '../../../generated/prisma/enums';

const router = Router();

router.post('/', auth(Role.ADMIN), CategoryController.createCategory);

router.get('/', CategoryController.getAllCategories);

router.get('/:id', auth(Role.ADMIN), CategoryController.getSingleCategory);

router.patch('/:id', auth(Role.ADMIN), CategoryController.updateCategory);

router.delete('/:id', auth(Role.ADMIN), CategoryController.deleteCategory);

export const categoryRoutes = router;
