import { UserService } from '../../../src/services/user.service';
import { UserModel } from '../../../src/models/user.model';
import { AuthService } from '../../../src/services/auth.service';
import { PoolClient } from 'pg';
import { UpdateUserDTO } from '../../../src/types/user.types';

describe('UserModel Integration Tests', () => {
  let userService: UserService;
  let mockClient: PoolClient;
  let mockUserModel: jasmine.SpyObj<UserModel>;

  beforeEach(() => {
    mockClient = {} as PoolClient;
    mockUserModel = jasmine.createSpyObj('UserModel', [
      'findAll',
      'findById',
      'checkEmailExists',
      'update',
      'updatePassword',
      'delete',
    ]);
    userService = new UserService(mockClient);
    (userService as any).userModel = mockUserModel;
  });

  it('should get all users', async () => {
    const users = [
      { id: 1, first_name: 'John', last_name: 'Doe' },
      { id: 2, first_name: 'Jane', last_name: 'Doe' },
    ];
    mockUserModel.findAll.and.returnValue(Promise.resolve(users));

    const result = await userService.getAllUsers();

    expect(result).toEqual([
      { id: 1, firstName: 'John', lastName: 'Doe' },
      { id: 2, firstName: 'Jane', lastName: 'Doe' },
    ]);
  });

  it('should get user profile', async () => {
    const user = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password_digest: 'hashedpassword',
    };
    mockUserModel.findById.and.returnValue(Promise.resolve(user));

    const result = await userService.getProfile(1);

    expect(result).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should update user profile', async () => {
    const updateData: UpdateUserDTO = {
      email: 'newemail@example.com',
      first_name: 'John',
      last_name: 'Doe',
      password_digest: 'hashedPassword',
    };

    const updatedProfile = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'newemail@example.com',
      password_digest: 'hashedpassword',
    };

    spyOn(AuthService, 'validateEmail').and.returnValue(true);
    mockUserModel.checkEmailExists.and.returnValue(Promise.resolve(false));
    mockUserModel.update.and.returnValue(Promise.resolve(updatedProfile));

    const result = await userService.updateProfile(1, updateData);

    expect(result).toEqual(updatedProfile);
    expect(AuthService.validateEmail).toHaveBeenCalledWith(
      'newemail@example.com'
    );
    expect(mockUserModel.checkEmailExists).toHaveBeenCalledWith(
      'newemail@example.com'
    );
  });

  it('should change user password', async () => {
    const user = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password_digest: 'hashedpassword',
    };

    mockUserModel.findById.and.returnValue(Promise.resolve(user));
    spyOn(AuthService, 'validatePassword').and.returnValue({ isValid: true });
    spyOn(AuthService, 'verifyPassword').and.returnValue(Promise.resolve(true));
    spyOn(AuthService, 'hashPassword').and.returnValue(
      Promise.resolve('newhashedpassword')
    );
    mockUserModel.updatePassword.and.returnValue(Promise.resolve(true));

    const result = await userService.changePassword(
      1,
      'currentPassword',
      'newPassword'
    );

    expect(result).toBe(true);
    expect(AuthService.validatePassword).toHaveBeenCalledWith('newPassword');
    expect(AuthService.verifyPassword).toHaveBeenCalledWith(
      'currentPassword',
      'hashedpassword'
    );
    expect(AuthService.hashPassword).toHaveBeenCalledWith('newPassword');
    expect(mockUserModel.updatePassword).toHaveBeenCalledWith(
      1,
      'newhashedpassword'
    );
  });

  it('should throw error when updating with invalid email', async () => {
    const updateData: UpdateUserDTO = {
      email: 'invalid-email',
      first_name: 'John',
      last_name: 'Doe',
      password_digest: 'hashedpassword',
    };

    spyOn(AuthService, 'validateEmail').and.returnValue(false);

    await expectAsync(
      userService.updateProfile(1, updateData)
    ).toBeRejectedWith(new Error('Invalid email format'));
  });

  it('should throw error when updating with existing email', async () => {
    const updateData: UpdateUserDTO = {
      email: 'existing@example.com',
      first_name: 'John',
      last_name: 'Doe',
      password_digest: 'hashedpassword',
    };

    spyOn(AuthService, 'validateEmail').and.returnValue(true);
    mockUserModel.checkEmailExists.and.returnValue(Promise.resolve(true));

    await expectAsync(
      userService.updateProfile(1, updateData)
    ).toBeRejectedWith(new Error('Email already in use'));
  });

  it('should delete user account', async () => {
    mockUserModel.delete.and.returnValue(Promise.resolve(true));

    const result = await userService.deleteAccount(1);

    expect(result).toBe(true);
    expect(mockUserModel.delete).toHaveBeenCalledWith(1);
  });
});
