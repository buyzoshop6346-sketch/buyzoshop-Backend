import { Request, Response } from 'express';

import { createPathaoOrder, getPathaoStores } from './pathao.service';
import { prisma } from '../../lib/prisma';

export const syncOrdersToPathao = async (req: Request, res: Response) => {
  const { orderIds } = req.body;

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please select at least one order.',
    });
  }

  const orders = await prisma.order.findMany({
    where: {
      id: {
        in: orderIds,
      },
    },

    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const success = [];
  const failed = [];

  for (const order of orders) {
    try {
      const result = await createPathaoOrder(order);

      success.push({
        orderId: order.id,
        consignmentId: result?.data?.consignment_id,
        message: result?.message || 'Order created successfully',
      });
    } catch (error: any) {
      console.error(
        `Pathao failed for order ${order.id}`,
        error?.response?.data || error,
      );

      failed.push({
        orderId: order.id,
        message:
          error?.response?.data?.message || 'Failed to create Pathao order',
      });
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Pathao sync completed.',
    data: {
      success,
      failed,
    },
  });
};

export const getStores = async (req: Request, res: Response) => {
  const data = await getPathaoStores();

  return res.status(200).json({
    success: true,
    data,
  });
};
