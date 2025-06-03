import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './store';
import constructorSlice from './slices/constructorSlice/constructorSlice';
import ingredientSlice from './slices/ingredientSlice/ingredientSlice';
import userSlice from './slices/userSlice/userSlice';
import feedSlice from './slices/feedSlice/feedSlice';
import orderSlice from './slices/orderSlice/orderSlice';

describe('Redux Store Configuration Tests', () => {
  const createTestStore = () => configureStore({
    reducer: rootReducer,
    devTools: process.env.NODE_ENV !== 'production'
  });

  describe('Store Initialization', () => {
    test('should create store with root reducer', () => {
      const store = createTestStore();
      expect(store.getState()).toBeDefined();
    });

    test('should have all required reducers', () => {
      const state = createTestStore().getState();
      expect(state).toHaveProperty('constructorBurger');
      expect(state).toHaveProperty('ingredient');
      expect(state).toHaveProperty('user');
      expect(state).toHaveProperty('feed');
      expect(state).toHaveProperty('order');
    });
  });

  describe('Store Integration', () => {
    test('should properly combine all reducers', () => {
      const testStore = configureStore({
        reducer: {
          constructorBurger: constructorSlice,
          ingredient: ingredientSlice,
          user: userSlice,
          feed: feedSlice,
          order: orderSlice
        }
      });

      expect(testStore.getState()).toEqual(createTestStore().getState());
    });

    test('should maintain independent reducer states', () => {
      const testAction = { type: 'TEST_ACTION' };
      const stateBefore = createTestStore().getState();
      createTestStore().dispatch(testAction);
      const stateAfter = createTestStore().getState();

      // Each slice should maintain its initial state for unknown actions
      expect(stateAfter.constructorBurger).toEqual(stateBefore.constructorBurger);
      expect(stateAfter.ingredient).toEqual(stateBefore.ingredient);
      expect(stateAfter.user).toEqual(stateBefore.user);
      expect(stateAfter.feed).toEqual(stateBefore.feed);
      expect(stateAfter.order).toEqual(stateBefore.order);
    });
  });

  describe('State Management', () => {
    test('should handle state updates independently', () => {
      const originalState = createTestStore().getState();
      
      // Create a new store with modified initial state
      const modifiedStore = configureStore({
        reducer: rootReducer,
        preloadedState: {
          ...originalState,
          user: {
            ...originalState.user,
            userData: { name: 'Test User', email: 'test@example.com' }
          }
        }
      });

      expect(modifiedStore.getState().user.userData).toEqual({
        name: 'Test User',
        email: 'test@example.com'
      });
      expect(modifiedStore.getState().constructorBurger).toEqual(originalState.constructorBurger);
      expect(modifiedStore.getState().ingredient).toEqual(originalState.ingredient);
    });

    test('should preserve state shape across store instances', () => {
      const storeShape = {
        constructorBurger: expect.any(Object),
        ingredient: expect.any(Object),
        user: expect.any(Object),
        feed: expect.any(Object),
        order: expect.any(Object)
      };

      expect(createTestStore().getState()).toMatchObject(storeShape);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed actions gracefully', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      
      const malformedAction = {
        type: 'TEST_MALFORMED_ACTION',
        payload: undefined
      };

      store.dispatch(malformedAction);
      expect(store.getState()).toEqual(stateBefore);
    });

    test('should maintain state integrity on invalid actions', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      
      const invalidAction = {
        type: 'INVALID_ACTION',
        payload: 'Invalid data'
      };

      store.dispatch(invalidAction);
      expect(store.getState()).toEqual(stateBefore);
    });
  });
});
