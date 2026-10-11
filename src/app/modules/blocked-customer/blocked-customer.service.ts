import { prisma } from '../../lib/prisma';

interface CreateBlockPayload {
  phone?: string;
  ipAddress?: string;
  reason: string;
}

interface GetBlockedCustomersParams {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');

  // Bangladesh phone number normalization
  if (digits.startsWith('8801') && digits.length === 13) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith('01') && digits.length === 11) {
    return digits;
  }

  return digits;
};

// ========================================
// CREATE BLOCK
// ========================================

const createBlock = async (payload: CreateBlockPayload) => {
  const phone = payload.phone ? normalizePhone(payload.phone) : undefined;

  const ipAddress = payload.ipAddress?.trim() || undefined;
  const reason = payload.reason.trim();

  if (!phone && !ipAddress) {
    throw new Error('Phone number or IP address is required.');
  }

  if (!reason) {
    throw new Error('Block reason is required.');
  }

  // Find an existing active block for either identifier.
  const existing = await prisma.blockedCustomer.findFirst({
    where: {
      isActive: true,
      OR: [
        ...(phone ? [{ phone }] : []),
        ...(ipAddress ? [{ ipAddress }] : []),
      ],
    },
  });

  if (existing) {
    throw new Error('This phone number or IP address is already blocked.');
  }

  // Reuse an inactive record if the identifier already exists.
  const existingRecord = await prisma.blockedCustomer.findFirst({
    where: {
      OR: [
        ...(phone ? [{ phone }] : []),
        ...(ipAddress ? [{ ipAddress }] : []),
      ],
    },
  });

  if (existingRecord) {
    // Avoid overwriting another identifier's existing record.
    const phoneConflict =
      phone && existingRecord.phone && existingRecord.phone !== phone;

    const ipConflict =
      ipAddress &&
      existingRecord.ipAddress &&
      existingRecord.ipAddress !== ipAddress;

    if (phoneConflict || ipConflict) {
      throw new Error('An identifier already belongs to another block record.');
    }

    return prisma.blockedCustomer.update({
      where: { id: existingRecord.id },
      data: {
        phone: phone ?? existingRecord.phone,
        ipAddress: ipAddress ?? existingRecord.ipAddress,
        reason,
        isActive: true,
      },
    });
  }

  return prisma.blockedCustomer.create({
    data: {
      phone,
      ipAddress,
      reason,
    },
  });
};

// ========================================
// GET BLOCK LIST + SEARCH + PAGINATION
// ========================================

const getBlockedCustomers = async ({
  search,
  page = 1,
  limit = 10,
  isActive,
}: GetBlockedCustomersParams) => {
  const currentPage = Math.max(1, page);
  const pageSize = Math.min(100, Math.max(1, limit));

  const where = {
    ...(typeof isActive === 'boolean' ? { isActive } : {}),
    ...(search
      ? {
          OR: [
            {
              phone: {
                contains: search.replace(/\D/g, ''),
              },
            },
            {
              ipAddress: {
                contains: search.trim(),
              },
            },
            {
              reason: {
                contains: search.trim(),
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {}),
  };

  const [data, total, activeCount, inactiveCount] = await Promise.all([
    prisma.blockedCustomer.findMany({
      where,

      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),

    prisma.blockedCustomer.count({
      where,
    }),

    prisma.blockedCustomer.count({
      where: {
        isActive: true,
      },
    }),

    prisma.blockedCustomer.count({
      where: {
        isActive: false,
      },
    }),
  ]);

  return {
    data,
    meta: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      activeCount,
      inactiveCount,
    },
  };
};

// ========================================
// UNBLOCK CUSTOMER
// ========================================

const unblockCustomer = async (id: string) => {
  const customer = await prisma.blockedCustomer.findUnique({
    where: { id },
  });

  if (!customer) {
    throw new Error('Blocked customer not found.');
  }

  if (!customer.isActive) {
    throw new Error('This customer is already unblocked.');
  }

  return prisma.blockedCustomer.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
};

// ========================================
// GET SINGLE BLOCK DETAILS
// ========================================

const getBlockedCustomerById = async (id: string) => {
  const customer = await prisma.blockedCustomer.findUnique({
    where: { id },
  });

  if (!customer) {
    throw new Error('Blocked customer not found.');
  }

  return customer;
};

export const blockedCustomerService = {
  createBlock,
  getBlockedCustomers,
  unblockCustomer,
  getBlockedCustomerById,
};
