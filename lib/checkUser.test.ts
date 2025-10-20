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

describe('checkUser', () => {
  let mockFindUnique: jest.Mock;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create fresh mocks for each test
    mockFindUnique = jest.fn();
    mockCreate = jest.fn();
    
    // Mock the db methods
    (db as any).user = {
      findUnique: mockFindUnique,
      create: mockCreate,
    };
  });

  it('should return null when no user is authenticated', async () => {
    // Arrange
    mockedCurrentUser.mockResolvedValue(null);

    // Act
    const result = await checkUser();

    // Assert
    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
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

    mockedCurrentUser.mockResolvedValue(mockClerkUser);
    mockFindUnique.mockResolvedValue(mockDbUser);

    // Act
    const result = await checkUser();

    // Assert
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { clerkUserId: 'user_123' }
    });
    expect(mockCreate).not.toHaveBeenCalled();
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

    mockedCurrentUser.mockResolvedValue(mockClerkUser);
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue(mockNewUser);

    // Act
    const result = await checkUser();

    // Assert
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { clerkUserId: 'user_456' }
    });
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        clerkUserId: 'user_456',
        name: 'Jane Smith',
        imageUrl: 'https://example.com/avatar2.jpg',
        email: 'jane@example.com'
      }
    });
    expect(result).toEqual(mockNewUser);
  });

  it('should handle user with missing optional fields', async () => {
    // Arrange
    const mockClerkUser = {
      id: 'user_789',
      firstName: 'Bob',
      lastName: null, // Missing lastName
      imageUrl: null, // Missing imageUrl
      emailAddresses: [{ emailAddress: 'bob@example.com' }]
    };

    const mockNewUser = {
      id: 'db_789',
      clerkUserId: 'user_789',
      name: 'Bob null', // Should handle null lastName
      imageUrl: null,
      email: 'bob@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedCurrentUser.mockResolvedValue(mockClerkUser);
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue(mockNewUser);

    // Act
    const result = await checkUser();

    // Assert
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        clerkUserId: 'user_789',
        name: 'Bob null',
        imageUrl: null,
        email: 'bob@example.com'
      }
    });
    expect(result).toEqual(mockNewUser);
  });

  it('should handle database errors gracefully', async () => {
    // Arrange
    const mockClerkUser = {
      id: 'user_error',
      firstName: 'Error',
      lastName: 'User',
      imageUrl: 'https://example.com/error.jpg',
      emailAddresses: [{ emailAddress: 'error@example.com' }]
    };

    mockedCurrentUser.mockResolvedValue(mockClerkUser);
    mockFindUnique.mockRejectedValue(new Error('Database connection failed'));

    // Act & Assert
    await expect(checkUser()).rejects.toThrow('Database connection failed');
  });
})