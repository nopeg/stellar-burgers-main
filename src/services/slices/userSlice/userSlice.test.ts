import userSlice, {
  getUser,
  getOrdersAll,
  initialState,
  registerUser,
  loginUser,
  updateUser,
  logoutUser
} from './userSlice';
import { TUser, TOrder } from '@utils-types';

type TUserState = {
  userData: TUser | null;
  userOrders: TOrder[];
  request: boolean;
  loginUserRequest: boolean;
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  error: string | null;
  response: TUser | null;
  registerData: any;
};

describe('User Management System Tests', () => {
  let baseState: TUserState;
  const mockAstronaut: TUser = {
    name: 'Stellar Commander',
    email: 'commander@cosmic-kitchen.space'
  };

  const mockOrder: TOrder = {
    _id: 'NGC-1',
    number: 42,
    name: 'Nebula Burger',
    status: 'done',
    ingredients: ['ingredient1', 'ingredient2'],
    createdAt: '2024-03-15T12:00:00.000Z',
    updatedAt: '2024-03-15T12:10:00.000Z'
  };

  beforeEach(() => {
    baseState = {
      userData: null,
      userOrders: [],
      request: false,
      loginUserRequest: false,
      isAuthChecked: false,
      isAuthenticated: false,
      error: null,
      response: null,
      registerData: null
    };
  });

  describe('Initial State', () => {
    test('should return default initial state', () => {
      const state = userSlice(undefined, { type: 'UNKNOWN_ACTION' });
      expect(state).toEqual(initialState);
    });

    test('should have correct initial values', () => {
      expect(initialState.userData).toBeNull();
      expect(initialState.userOrders).toEqual([]);
      expect(initialState.request).toBeFalsy();
      expect(initialState.loginUserRequest).toBeFalsy();
      expect(initialState.isAuthChecked).toBeFalsy();
      expect(initialState.isAuthenticated).toBeFalsy();
      expect(initialState.error).toBeNull();
      expect(initialState.response).toBeNull();
    });
  });

  describe('User Profile Management', () => {
    describe('Get User Profile', () => {
      test('should handle profile fetch initiation', () => {
        const state = userSlice(baseState, {
          type: getUser.pending.type,
          payload: null
        });
        expect(state.request).toBeFalsy();
        expect(state.error).toBeNull();
        expect(state.userData).toBeNull();
      });

      test('should handle successful profile retrieval', () => {
        const state = userSlice(baseState, {
          type: getUser.fulfilled.type,
          payload: { user: mockAstronaut }
        });
        expect(state.request).toBeFalsy();
        expect(state.error).toBeNull();
        expect(state.userData).toEqual(mockAstronaut);
      });

      test('should handle profile fetch failure', () => {
        const state = userSlice(baseState, {
          type: getUser.rejected.type,
          payload: null
        });
        expect(state.request).toBeFalsy();
        expect(state.error).toBeNull();
        expect(state.userData).toBeNull();
      });
    });

    describe('Order History Management', () => {
      const mockOrders: TOrder[] = [
        {
          _id: 'NGC-1',
          number: 42,
          name: 'Nebula Burger',
          status: 'done',
          ingredients: ['ingredient1', 'ingredient2'],
          createdAt: '2024-03-15T12:00:00.000Z',
          updatedAt: '2024-03-15T12:10:00.000Z'
        },
        {
          _id: 'NGC-2',
          number: 43,
          name: 'Cosmic Wrap',
          status: 'pending',
          ingredients: ['ingredient3', 'ingredient4'],
          createdAt: '2024-03-15T12:15:00.000Z',
          updatedAt: '2024-03-15T12:15:00.000Z'
        }
      ];

      test('should initiate order history fetch', () => {
        const state = userSlice(baseState, {
          type: getOrdersAll.pending.type,
          payload: null
        });
        expect(state.request).toBeTruthy();
        expect(state.error).toBeNull();
      });

      test('should handle successful order history retrieval', () => {
        const state = userSlice(baseState, {
          type: getOrdersAll.fulfilled.type,
          payload: mockOrders
        });
        expect(state.request).toBeFalsy();
        expect(state.error).toBeNull();
        expect(state.userOrders).toEqual(mockOrders);
      });

      test('should handle order history fetch failure', () => {
        const error = 'Quantum Entanglement Error: Orders lost in space-time';
        const state = userSlice(baseState, {
          type: getOrdersAll.rejected.type,
          error: { message: error }
        });
        expect(state.request).toBeFalsy();
        expect(state.error).toBe(error);
      });
    });
  });

  describe('Authentication Flow', () => {
    describe('User Registration', () => {
      test('should handle registration process initiation', () => {
        const state = userSlice(baseState, {
          type: registerUser.pending.type,
          payload: null
        });
        expect(state.request).toBeTruthy();
        expect(state.error).toBeNull();
      });

      test('should handle successful registration', () => {
        const state = userSlice(baseState, {
          type: registerUser.fulfilled.type,
          payload: { user: mockAstronaut }
        });
        expect(state.request).toBeFalsy();
        expect(state.error).toBeNull();
        expect(state.userData).toEqual(mockAstronaut);
      });

      test('should handle registration failure', () => {
        const error = 'Space Station Error: Invalid credentials format';
        const state = userSlice(baseState, {
          type: registerUser.rejected.type,
          error: { message: error }
        });
        expect(state.request).toBeFalsy();
        expect(state.error).toBe(error);
      });
    });

    describe('User Login', () => {
      test('should handle login initiation', () => {
        const state = userSlice(baseState, {
          type: loginUser.pending.type,
          payload: null
        });
        expect(state.loginUserRequest).toBeTruthy();
        expect(state.isAuthChecked).toBeTruthy();
        expect(state.isAuthenticated).toBeFalsy();
      });

      test('should handle successful login', () => {
        const state = userSlice(baseState, {
          type: loginUser.fulfilled.type,
          payload: { user: mockAstronaut }
        });
        expect(state.loginUserRequest).toBeFalsy();
        expect(state.isAuthenticated).toBeTruthy();
        expect(state.userData).toEqual(mockAstronaut);
      });

      test('should handle login failure', () => {
        const error = 'Asteroid Belt Error: Invalid access token';
        const state = userSlice(baseState, {
          type: loginUser.rejected.type,
          error: { message: error }
        });
        expect(state.loginUserRequest).toBeFalsy();
        expect(state.isAuthenticated).toBeFalsy();
        expect(state.error).toBe(error);
      });
    });

    describe('Profile Updates', () => {
      const updatedAstronaut = {
        ...mockAstronaut,
        name: 'Senior Stellar Commander'
      };

      test('should handle update initiation', () => {
        const state = userSlice(baseState, {
          type: updateUser.pending.type,
          payload: null
        });
        expect(state.request).toBeTruthy();
        expect(state.error).toBeNull();
      });

      test('should handle successful profile update', () => {
        const state = userSlice(baseState, {
          type: updateUser.fulfilled.type,
          payload: { user: updatedAstronaut }
        });
        expect(state.request).toBeFalsy();
        expect(state.error).toBeNull();
        expect(state.response).toEqual(updatedAstronaut);
      });

      test('should handle update failure', () => {
        const error = 'Solar Flare Error: Profile update failed';
        const state = userSlice(baseState, {
          type: updateUser.rejected.type,
          error: { message: error }
        });
        expect(state.request).toBeFalsy();
        expect(state.error).toBe(error);
      });

      test('should preserve existing data on update failure', () => {
        const stateWithUser = {
          ...baseState,
          userData: mockAstronaut
        };
        const state = userSlice(stateWithUser, {
          type: updateUser.rejected.type,
          error: { message: 'Update failed' }
        });
        expect(state.userData).toEqual(mockAstronaut);
      });
    });

    describe('Logout Process', () => {
      const authenticatedState = {
        ...baseState,
        isAuthenticated: true,
        userData: mockAstronaut
      };

      test('should handle logout initiation', () => {
        const state = userSlice(authenticatedState, {
          type: logoutUser.pending.type,
          payload: null
        });
        expect(state.request).toBeTruthy();
        expect(state.isAuthChecked).toBeTruthy();
        expect(state.isAuthenticated).toBeTruthy();
      });

      test('should handle successful logout', () => {
        const state = userSlice(authenticatedState, {
          type: logoutUser.fulfilled.type,
          payload: null
        });
        expect(state.request).toBeFalsy();
        expect(state.isAuthenticated).toBeFalsy();
        expect(state.userData).toBeNull();
      });

      test('should handle logout failure', () => {
        const error = 'Black Hole Error: Unable to terminate session';
        const state = userSlice(authenticatedState, {
          type: logoutUser.rejected.type,
          error: { message: error }
        });
        expect(state.request).toBeFalsy();
        expect(state.error).toBe(error);
        expect(state.isAuthenticated).toBeTruthy();
        expect(state.userData).toEqual(mockAstronaut);
      });

      test('should clear all user-related data after successful logout', () => {
        const state = userSlice(authenticatedState, {
          type: logoutUser.fulfilled.type,
          payload: null
        });
        expect(state.userOrders).toEqual(authenticatedState.userOrders);
        expect(state.response).toEqual(authenticatedState.response);
        expect(state.userData).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.isAuthChecked).toBe(false);
        expect(state.error).toBeNull();
        expect(state.request).toBe(false);
      });
    });
  });
});
