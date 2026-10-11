import { Request, Response } from 'express';

import { blockedCustomerService } from './blocked-customer.service';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';

// ========================================
// CREATE BLOCK
// POST /blocked-customers
// ========================================

const createBlock = catchAsync(async (req: Request, res: Response) => {
  const result = await blockedCustomerService.createBlock(req.body);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: 'Customer blocked successfully.',
    data: result,
  });
});

// ========================================
// GET BLOCK LIST
// GET /blocked-customers
// ========================================

const getBlockedCustomers = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const search =
    typeof req.query.search === 'string' ? req.query.search : undefined;

  const isActive =
    req.query.status === 'blocked'
      ? true
      : req.query.status === 'unblocked'
        ? false
        : undefined;

  const result = await blockedCustomerService.getBlockedCustomers({
    page,
    limit,
    search,
    isActive,
  });

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Blocked customer list retrieved successfully.',
    data: result.data,
  });
});

// ========================================
// GET SINGLE BLOCK DETAILS
// GET /blocked-customers/:id
// ========================================

const getBlockedCustomerById = catchAsync(
  async (req: Request, res: Response) => {
    const result = await blockedCustomerService.getBlockedCustomerById(
      req.params.id as string,
    );

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: 'Blocked customer retrieved successfully.',
      data: result,
    });
  },
);

// ========================================
// UNBLOCK
// PATCH /blocked-customers/:id/unblock
// ========================================

const unblockCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await blockedCustomerService.unblockCustomer(
    req.params.id as string,
  );

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Customer unblocked successfully.',
    data: result,
  });
});

export const blockedCustomerController = {
  createBlock,
  getBlockedCustomers,
  getBlockedCustomerById,
  unblockCustomer,
};
