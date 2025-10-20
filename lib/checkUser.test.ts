// Mock the modules before any imports
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { checkUser } from './checkUser';

const mockedCurrentUser = currentUser as jest.MockedFunction<typeof currentUser>;
const mockedDb = db as any;

describe('checkUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null when no user is authenticated', async () => {
    // Arrange
    mockedCurrentUser.mockResolvedValue(null);

    // Act
    const result = await checkUser();

    // Assert
    expect(result).toBeNull();
    expect(mockedDb.user.findUnique).not.toHaveBeenCalled();
    expect(mockedDb.user.create).not.toHaveBeenCalled();
  });

  it('should return existing user when found in database', async () => {
    // Arrange
    const mockClerkUser = {
      id: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      imageUrl: 'https://example.com/avatar.jpg',
      emailAddresses: [{ emailAddress: 'john@example.com' }]
    };

    const mockDbUser = {
      id: 'db_123',
      clerkUserId: 'user_123',
      name: 'John Doe',
      imageUrl: 'https://example.com/avatar.jpg',
      email: 'john@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedCurrentUser.mockResolvedValue(mockClerkUser as any);
    mockedDb.user.findUnique.mockResolvedValue(mockDbUser);

    // Act
    const result = await checkUser();

    // Assert
    expect(mockedDb.user.findUnique).toHaveBeenCalledWith({
      where: { clerkUserId: 'user_123' }
    });
    expect(mockedDb.user.create).not.toHaveBeenCalled();
    expect(result).toEqual(mockDbUser);
  });

  it('should create new user when not found in database', async () => {
    // Arrange
    const mockClerkUser = {
      id: 'user_456',
      firstName: 'Jane',
      lastName: 'Smith',
      imageUrl: 'https://example.com/avatar2.jpg',
      emailAddresses: [{ emailAddress: 'jane@example.com' }]
    };

    const mockNewUser = {
      id: 'db_456',
      clerkUserId: 'user_456',
      name: 'Jane Smith',
      imageUrl: 'https://example.com/avatar2.jpg',
      email: 'jane@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedCurrentUser.mockResolvedValue(mockClerkUser as any);
    mockedDb.user.findUnique.mockResolvedValue(null);
    mockedDb.user.create.mockResolvedValue(mockNewUser);

    // Act
    const result = await checkUser();

    // Assert
    expect(mockedDb.user.findUnique).toHaveBeenCalled();
    expect(mockedDb.user.create).toHaveBeenCalledWith({
      data: {
        clerkUserId: 'user_456',
        name: 'Jane Smith',
        imageUrl: 'https://example.com/avatar2.jpg',
        email: 'jane@example.com'
      }
    });
    expect(result).toEqual(mockNewUser);
  });
});