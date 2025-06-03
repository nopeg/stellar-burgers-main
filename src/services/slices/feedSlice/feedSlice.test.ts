import feedReducer, { getFeeds, initialState, getFeedState } from './feedSlice';
import { expect, test, describe, beforeEach } from '@jest/globals';
import { TOrder } from '@utils-types';
import type { RootState } from '../../store';

type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  loading: boolean;
  error: string | null;
};

describe('Feed Slice Tests', () => {
  let baseState: TFeedState;
  let mockOrders: TOrder[];

  beforeEach(() => {
    baseState = {
      orders: [],
      total: 0,
      totalToday: 0,
      loading: false,
      error: null
    };

    mockOrders = [
      {
        _id: 'order1',
        number: 12345,
        name: 'Cosmic Burger',
        status: 'done',
        ingredients: ['ingredient1', 'ingredient2'],
        createdAt: '2024-04-20T10:00:00.000Z',
        updatedAt: '2024-04-20T10:01:00.000Z'
      },
      {
        _id: 'order2',
        number: 12346,
        name: 'Stellar Sandwich',
        status: 'pending',
        ingredients: ['ingredient3', 'ingredient4', 'ingredient5'],
        createdAt: '2024-04-20T10:02:00.000Z',
        updatedAt: '2024-04-20T10:02:00.000Z'
      },
      {
        _id: 'order3',
        number: 12347,
        name: 'Galactic Wrap',
        status: 'created',
        ingredients: ['ingredient6'],
        createdAt: '2024-04-20T10:03:00.000Z',
        updatedAt: '2024-04-20T10:03:00.000Z'
      }
    ];
  });

  describe('Initial State', () => {
    test('should return the initial state', () => {
      const state = feedReducer(undefined, { type: 'INIT' });
      expect(state).toEqual(initialState);
    });

    test('should match the expected initial state structure', () => {
      expect(initialState).toEqual({
        orders: [],
        total: 0,
        totalToday: 0,
        loading: false,
        error: null
      });
    });
  });

  describe('getFeeds Async Action Tests', () => {
    describe('Pending State', () => {
      test('should handle getFeeds.pending', () => {
        const state = feedReducer(baseState, {
          type: getFeeds.pending.type
        });
        
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.orders).toEqual([]);
        expect(state.total).toBe(0);
        expect(state.totalToday).toBe(0);
      });

      test('should preserve existing data during loading', () => {
        const stateWithData = {
          ...baseState,
          orders: mockOrders,
          total: 100,
          totalToday: 10
        };

        const state = feedReducer(stateWithData, {
          type: getFeeds.pending.type
        });
        
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.orders).toEqual(mockOrders);
        expect(state.total).toBe(100);
        expect(state.totalToday).toBe(10);
      });
    });

    describe('Fulfilled State', () => {
      test('should handle empty orders response', () => {
        const state = feedReducer(baseState, {
          type: getFeeds.fulfilled.type,
          payload: {
            orders: [],
            total: 0,
            totalToday: 0
          }
        });
        
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.orders).toEqual([]);
        expect(state.total).toBe(0);
        expect(state.totalToday).toBe(0);
      });

      test('should handle successful orders response', () => {
        const state = feedReducer(baseState, {
          type: getFeeds.fulfilled.type,
          payload: {
            orders: mockOrders,
            total: 150,
            totalToday: 25
          }
        });
        
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.orders).toEqual(mockOrders);
        expect(state.total).toBe(150);
        expect(state.totalToday).toBe(25);
      });

      test('should replace existing data with new data', () => {
        const stateWithOldData = {
          ...baseState,
          orders: [mockOrders[0]],
          total: 50,
          totalToday: 5
        };

        const newOrders = [mockOrders[1], mockOrders[2]];
        const state = feedReducer(stateWithOldData, {
          type: getFeeds.fulfilled.type,
          payload: {
            orders: newOrders,
            total: 200,
            totalToday: 30
          }
        });
        
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.orders).toEqual(newOrders);
        expect(state.total).toBe(200);
        expect(state.totalToday).toBe(30);
      });
    });

    describe('Rejected State', () => {
      test('should handle network errors', () => {
        const error = 'Network Error: Failed to fetch';
        const state = feedReducer(baseState, {
          type: getFeeds.rejected.type,
          error: { message: error }
        });
        
        expect(state.loading).toBe(false);
        expect(state.error).toBe(error);
        expect(state.orders).toEqual([]);
      });

      test('should handle server errors', () => {
        const error = 'Server Error: Internal Server Error';
        const state = feedReducer(baseState, {
          type: getFeeds.rejected.type,
          error: { message: error }
        });
        
        expect(state.loading).toBe(false);
        expect(state.error).toBe(error);
        expect(state.orders).toEqual([]);
      });

      test('should preserve existing data on error', () => {
        const stateWithData = {
          ...baseState,
          orders: mockOrders,
          total: 100,
          totalToday: 10
        };

        const error = 'Failed to fetch orders';
        const state = feedReducer(stateWithData, {
          type: getFeeds.rejected.type,
          error: { message: error }
        });
        
        expect(state.loading).toBe(false);
        expect(state.error).toBe(error);
        expect(state.orders).toEqual(mockOrders);
        expect(state.total).toBe(100);
        expect(state.totalToday).toBe(10);
      });
    });
  });

  describe('Feed Selectors', () => {
    test('getFeedState should return the feed state', () => {
      const mockRootState = {
        feed: {
          ...baseState,
          orders: mockOrders,
          total: 100,
          totalToday: 10
        }
      } as RootState;
      
      const selectedState = getFeedState(mockRootState);
      expect(selectedState).toEqual(mockRootState.feed);
    });

    test('getFeedState should handle empty state', () => {
      const mockRootState = {
        feed: baseState
      } as RootState;
      
      const selectedState = getFeedState(mockRootState);
      expect(selectedState).toEqual(baseState);
    });

    test('getFeedState should handle loading state', () => {
      const loadingState = {
        ...baseState,
        loading: true
      };
      const mockRootState = {
        feed: loadingState
      } as RootState;
      
      const selectedState = getFeedState(mockRootState);
      expect(selectedState.loading).toBe(true);
    });

    test('getFeedState should handle error state', () => {
      const errorState = {
        ...baseState,
        error: 'Test error'
      };
      const mockRootState = {
        feed: errorState
      } as RootState;
      
      const selectedState = getFeedState(mockRootState);
      expect(selectedState.error).toBe('Test error');
    });
  });
});
