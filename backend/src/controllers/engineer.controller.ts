import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword, validatePasswordStrength } from '../utils/password';

/**
 * Get all engineers
 */
export const getEngineers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    const where: any = { role: 'ENGINEER' };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [engineers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              appointmentsAsEngineer: true,
              workerVisits: true,
            },
          },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: engineers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get engineers error:', error);
    res.status(500).json({ error: 'Failed to fetch engineers' });
  }
};

/**
 * Get engineer by ID
 */
export const getEngineer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const engineer = await prisma.user.findFirst({
      where: { id, role: 'ENGINEER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            appointmentsAsEngineer: true,
            inventoryTransactions: true,
            workerVisits: true,
          },
        },
      },
    });

    if (!engineer) {
      res.status(404).json({ error: 'Engineer not found' });
      return;
    }

    res.json(engineer);
  } catch (error) {
    console.error('Get engineer error:', error);
    res.status(500).json({ error: 'Failed to fetch engineer' });
  }
};

/**
 * Create new engineer
 */
export const createEngineer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ error: passwordValidation.message });
      return;
    }

    // Validate phone number
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      res.status(400).json({ error: 'Invalid phone number' });
      return;
    }

    // Check for existing email or phone
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existing) {
      res.status(409).json({ error: 'Email or phone already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create engineer
    const engineer = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'ENGINEER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json(engineer);
  } catch (error) {
    console.error('Create engineer error:', error);
    res.status(500).json({ error: 'Failed to create engineer' });
  }
};

/**
 * Update engineer
 */
export const updateEngineer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, isActive } = req.body;

    // Check if engineer exists
    const existing = await prisma.user.findFirst({
      where: { id, role: 'ENGINEER' },
    });

    if (!existing) {
      res.status(404).json({ error: 'Engineer not found' });
      return;
    }

    // Validate phone if provided
    if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      res.status(400).json({ error: 'Invalid phone number' });
      return;
    }

    // Check for duplicate email/phone
    if (email || phone) {
      const duplicate = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                email ? { email } : {},
                phone ? { phone } : {},
              ],
            },
          ],
        },
      });

      if (duplicate) {
        res.status(409).json({ error: 'Email or phone already exists' });
        return;
      }
    }

    const engineer = await prisma.user.update({
      where: { id },
      data: { name, email, phone, isActive },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(engineer);
  } catch (error) {
    console.error('Update engineer error:', error);
    res.status(500).json({ error: 'Failed to update engineer' });
  }
};

/**
 * Delete/deactivate engineer
 */
export const deleteEngineer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if engineer exists
    const engineer = await prisma.user.findFirst({
      where: { id, role: 'ENGINEER' },
      include: {
        _count: {
          select: {
            appointmentsAsEngineer: true,
            workerVisits: true,
          },
        },
      },
    });

    if (!engineer) {
      res.status(404).json({ error: 'Engineer not found' });
      return;
    }

    // Always deactivate (preserve history)
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Engineer deactivated successfully' });
  } catch (error) {
    console.error('Delete engineer error:', error);
    res.status(500).json({ error: 'Failed to delete engineer' });
  }
};

/**
 * Reset engineer password (Admin only)
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({ error: 'New password is required' });
      return;
    }

    // Validate password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.valid) {
      res.status(400).json({ error: validation.message });
      return;
    }

    // Check if engineer exists
    const engineer = await prisma.user.findFirst({
      where: { id, role: 'ENGINEER' },
    });

    if (!engineer) {
      res.status(404).json({ error: 'Engineer not found' });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
