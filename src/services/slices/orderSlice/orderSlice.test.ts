import { TOrder } from '@utils-types';
import orderSlice, { initialState, getOrderByNumber, getOrderState } from './orderSlice';
import { getOrderByNumberApi } from '../../../utils/burger-api';

// Mock the API call
jest.mock('../../../utils/burger-api');
const mockedGetOrderByNumberApi = getOrderByNumberApi as jest.MockedFunction<typeof getOrderByNumberApi>;

// Space-themed mock order data
const mockCosmicOrder: TOrder = {
  _id: 'cosmic-123',
  number: 42,
  name: 'Stellar Feast',
  status: 'done',
  createdAt: '2024-03-15T12:00:00.000Z',
  updatedAt: '2024-03-15T12:10:00.000Z',
  ingredients: ['nebula-bun-01', 'quantum-patty-01', 'dark-matter-sauce-01']
};

describe('Order Slice Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    test('should return the initial state', () => {
      const state = orderSlice(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    test('should have correct initial values', () => {
      expect(initialState.orders).toHaveLength(0);
      expect(initialState.orderByNumberResponse).toBeNull();
      expect(initialState.request).toBeFalsy();
      expect(initialState.responseOrder).toBeNull();
      expect(initialState.error).toBeNull();
    });
  });

  describe('Selectors', () => {
    test('getOrderState should return the entire state', () => {
      const state = { order: initialState };
      expect(getOrderState(state)).toEqual(initialState);
    });
  });

  describe('getOrderByNumber Async Action', () => {
    describe('Successful Order Retrieval', () => {
      beforeEach(() => {
        mockedGetOrderByNumberApi.mockResolvedValue({ success: true, orders: [mockCosmicOrder] });
      });

      test('should handle pending state correctly', () => {
        const nextState = orderSlice(initialState, {
          type: getOrderByNumber.pending.type,
          payload: undefined
        });
        expect(nextState.request).toBe(true);
        expect(nextState.error).toBeNull();
        expect(nextState.orderByNumberResponse).toBeNull();
      });

      test('should handle successful order retrieval', () => {
        const nextState = orderSlice(initialState, {
          type: getOrderByNumber.fulfilled.type,
          payload: { success: true, orders: [mockCosmicOrder] }
        });
        expect(nextState.request).toBe(false);
        expect(nextState.error).toBeNull();
        expect(nextState.orderByNumberResponse).toEqual(mockCosmicOrder);
      });

      test('should preserve existing orders while updating orderByNumberResponse', () => {
        const stateWithOrders = {
          ...initialState,
          orders: [{ ...mockCosmicOrder, number: 41 }]
        };
        const nextState = orderSlice(stateWithOrders, {
          type: getOrderByNumber.fulfilled.type,
          payload: { success: true, orders: [mockCosmicOrder] }
        });
        expect(nextState.orders).toHaveLength(1);
        expect(nextState.orderByNumberResponse).toEqual(mockCosmicOrder);
      });
    });

    describe('Error Handling', () => {
      const cosmicError = 'Quantum Entanglement Error: Order lost in space-time';

      test('should handle network errors', () => {
        const nextState = orderSlice(initialState, {
          type: getOrderByNumber.rejected.type,
          error: { message: cosmicError }
        });
        expect(nextState.request).toBe(false);
        expect(nextState.error).toBe(cosmicError);
        expect(nextState.orderByNumberResponse).toBeNull();
      });

      test('should handle empty order response', () => {
        const nextState = orderSlice(initialState, {
          type: getOrderByNumber.fulfilled.type,
          payload: { success: true, orders: [] }
        });
        expect(nextState.request).toBe(false);
        expect(nextState.error).toBeNull();
        expect(nextState.orderByNumberResponse).toBeUndefined();
      });

      test('should preserve previous order data on error', () => {
        const stateWithOrder = {
          ...initialState,
          orderByNumberResponse: mockCosmicOrder
        };
        const nextState = orderSlice(stateWithOrder, {
          type: getOrderByNumber.rejected.type,
          error: { message: cosmicError }
        });
        expect(nextState.request).toBe(false);
        expect(nextState.error).toBe(cosmicError);
        expect(nextState.orderByNumberResponse).toEqual(mockCosmicOrder);
      });
    });

    describe('Edge Cases', () => {
      test('should handle malformed order data gracefully', () => {
        const malformedOrder = {
          success: true,
          orders: [{ _id: 'invalid-order' }] // Incomplete order data
        };
        const nextState = orderSlice(initialState, {
          type: getOrderByNumber.fulfilled.type,
          payload: malformedOrder
        });
        expect(nextState.request).toBe(false);
        expect(nextState.error).toBeNull();
        expect(nextState.orderByNumberResponse).toEqual(malformedOrder.orders[0]);
      });

      test('should handle undefined error message', () => {
        const nextState = orderSlice(initialState, {
          type: getOrderByNumber.rejected.type,
          error: {}
        });
        expect(nextState.request).toBe(false);
        expect(nextState.error).toBeUndefined();
      });

      test('should handle unsuccessful response', () => {
        const nextState = orderSlice(initialState, {
          type: getOrderByNumber.fulfilled.type,
          payload: { success: false, orders: [] }
        });
        expect(nextState.request).toBe(false);
        expect(nextState.error).toBeNull();
        expect(nextState.orderByNumberResponse).toBeUndefined();
      });
    });
  });
});
