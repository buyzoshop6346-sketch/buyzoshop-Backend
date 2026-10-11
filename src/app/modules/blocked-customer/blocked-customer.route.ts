import { Router } from 'express';

import { blockedCustomerController } from './blocked-customer.controller';
import { auth } from '../../middleware/auth';
import { Role } from '../../../generated/prisma/enums';

const router = Router();
const accessRole = auth(Role.ADMIN, Role.SUPER_ADMIN);

router.post('/', accessRole, blockedCustomerController.createBlock);

router.get('/', accessRole, blockedCustomerController.getBlockedCustomers);

router.get(
  '/:id',
  accessRole,
  blockedCustomerController.getBlockedCustomerById,
);

router.patch(
  '/:id/unblock',
  accessRole,
  blockedCustomerController.unblockCustomer,
);

export const blockedCustomerRoutes = router;
