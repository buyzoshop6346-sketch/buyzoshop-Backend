import { Router } from 'express';

import { getStores, syncOrdersToPathao } from './pathao.controller';

const router = Router();

router.post('/orders/sync', syncOrdersToPathao);
router.get('/stores', getStores);

export const pathaoRoutes = router;
