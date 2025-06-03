import ingredientSlice, {
  getIngredients,
  initialState
} from './ingredientSlice';
import { expect, test, describe, beforeEach } from '@jest/globals';
import { TIngredient } from '@utils-types';

type TIngredientState = {
  ingredients: TIngredient[];
  loading: boolean;
  error: string | null;
};

describe('ingredientSlice reducer tests', () => {
  let baseState: TIngredientState;
  let mockIngredients: TIngredient[];

  beforeEach(() => {
    baseState = {
      ingredients: [],
      loading: false,
      error: null
    };

    mockIngredients = [
      {
        _id: 'ing1',
        name: 'Quantum Bun',
        type: 'bun',
        proteins: 80,
        fat: 24,
        carbohydrates: 53,
        calories: 420,
        price: 200,
        image: 'https://example.com/quantum-bun.png',
        image_mobile: 'https://example.com/quantum-bun-mobile.png',
        image_large: 'https://example.com/quantum-bun-large.png'
      },
      {
        _id: 'ing2',
        name: 'Nebula Patty',
        type: 'main',
        proteins: 420,
        fat: 142,
        carbohydrates: 0,
        calories: 4400,
        price: 300,
        image: 'https://example.com/nebula-patty.png',
        image_mobile: 'https://example.com/nebula-patty-mobile.png',
        image_large: 'https://example.com/nebula-patty-large.png'
      },
      {
        _id: 'ing3',
        name: 'Dark Matter Sauce',
        type: 'sauce',
        proteins: 50,
        fat: 22,
        carbohydrates: 11,
        calories: 14,
        price: 80,
        image: 'https://example.com/dark-matter-sauce.png',
        image_mobile: 'https://example.com/dark-matter-sauce-mobile.png',
        image_large: 'https://example.com/dark-matter-sauce-large.png'
      }
    ];
  });

  describe('initial state', () => {
    test('should return the initial state', () => {
      const state = ingredientSlice(undefined, { type: 'INIT' });
      expect(state).toEqual(initialState);
    });
  });

  describe('getIngredients async action tests', () => {
    describe('pending state', () => {
      test('should handle getIngredients.pending', () => {
        const state = ingredientSlice(baseState, {
          type: getIngredients.pending.type
        });
        
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.ingredients).toEqual([]);
      });

      test('should handle getIngredients.pending when there is existing data', () => {
        const stateWithData = {
          ...baseState,
          ingredients: mockIngredients
        };

        const state = ingredientSlice(stateWithData, {
          type: getIngredients.pending.type
        });
        
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        // Existing data should be preserved during loading
        expect(state.ingredients).toEqual(mockIngredients);
      });
    });

    describe('fulfilled state', () => {
      test('should handle getIngredients.fulfilled with empty ingredients', () => {
        const state = ingredientSlice(baseState, {
          type: getIngredients.fulfilled.type,
          payload: []
        });
        
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.ingredients).toEqual([]);
      });

      test('should handle getIngredients.fulfilled with ingredients', () => {
        const state = ingredientSlice(baseState, {
          type: getIngredients.fulfilled.type,
          payload: mockIngredients
        });
        
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.ingredients).toEqual(mockIngredients);
      });

      test('should handle getIngredients.fulfilled and replace existing data', () => {
        const stateWithOldData = {
          ...baseState,
          ingredients: [mockIngredients[0]]
        };

        const newIngredients = [mockIngredients[1], mockIngredients[2]];
        const state = ingredientSlice(stateWithOldData, {
          type: getIngredients.fulfilled.type,
          payload: newIngredients
        });
        
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.ingredients).toEqual(newIngredients);
      });

      test('should handle getIngredients.fulfilled with sorted ingredients by type', () => {
        const unsortedIngredients = [
          {
            _id: 'ing1',
            name: 'Quantum Bun',
            type: 'bun',
            proteins: 80,
            fat: 24,
            carbohydrates: 53,
            calories: 420,
            price: 200,
            image: 'https://example.com/quantum-bun.png',
            image_mobile: 'https://example.com/quantum-bun-mobile.png',
            image_large: 'https://example.com/quantum-bun-large.png'
          },
          {
            _id: 'ing2',
            name: 'Nebula Patty',
            type: 'main',
            proteins: 420,
            fat: 142,
            carbohydrates: 0,
            calories: 4400,
            price: 300,
            image: 'https://example.com/nebula-patty.png',
            image_mobile: 'https://example.com/nebula-patty-mobile.png',
            image_large: 'https://example.com/nebula-patty-large.png'
          },
          {
            _id: 'ing3',
            name: 'Dark Matter Sauce',
            type: 'sauce',
            proteins: 50,
            fat: 22,
            carbohydrates: 11,
            calories: 14,
            price: 80,
            image: 'https://example.com/dark-matter-sauce.png',
            image_mobile: 'https://example.com/dark-matter-sauce-mobile.png',
            image_large: 'https://example.com/dark-matter-sauce-large.png'
          }
        ];

        const state = ingredientSlice(baseState, {
          type: getIngredients.fulfilled.type,
          payload: unsortedIngredients
        });
        
        // Verify ingredients are stored in the order they were received
        expect(state.ingredients[0].type).toBe('bun');
        expect(state.ingredients[1].type).toBe('main');
        expect(state.ingredients[2].type).toBe('sauce');
      });
    });

    describe('rejected state', () => {
      test('should handle getIngredients.rejected with network error', () => {
        const error = 'Network Error: Failed to fetch ingredients';
        const state = ingredientSlice(baseState, {
          type: getIngredients.rejected.type,
          error: { message: error }
        });
        
        expect(state.loading).toBe(false);
        expect(state.error).toBe(error);
        expect(state.ingredients).toEqual([]);
      });

      test('should handle getIngredients.rejected with server error', () => {
        const error = 'Server Error: Internal Server Error';
        const state = ingredientSlice(baseState, {
          type: getIngredients.rejected.type,
          error: { message: error }
        });
        
        expect(state.loading).toBe(false);
        expect(state.error).toBe(error);
        expect(state.ingredients).toEqual([]);
      });

      test('should handle getIngredients.rejected and preserve existing data', () => {
        const stateWithData = {
          ...baseState,
          ingredients: mockIngredients
        };

        const error = 'Failed to fetch ingredients';
        const state = ingredientSlice(stateWithData, {
          type: getIngredients.rejected.type,
          error: { message: error }
        });
        
        expect(state.loading).toBe(false);
        expect(state.error).toBe(error);
        // Existing data should be preserved on error
        expect(state.ingredients).toEqual(mockIngredients);
      });
    });
  });
});
