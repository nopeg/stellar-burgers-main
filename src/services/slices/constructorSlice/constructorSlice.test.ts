import constructorSlice, {
  addIngredient,
  initialState,
  moveIngredientDown,
  moveIngredientUp,
  orderBurger,
  removeIngredient,
  resetModal,
  setRequest,
  TConsturctorState
} from './constructorSlice';
import { expect, test, describe, beforeEach } from '@jest/globals';
import { TOrder } from '@utils-types';

describe('constructorSlice reducer tests', () => {
  let baseState: TConsturctorState;

  beforeEach(() => {
    baseState = {
      constructorItems: {
        bun: null,
        ingredients: []
      },
      loading: false,
      orderRequest: false,
      orderModalData: null,
      error: null
    };
  });

  describe('addIngredient action tests', () => {
    test('should handle adding a new ingredient to empty constructor', () => {
      const sauceIngredient = {
        _id: '643d69a5c3f7b9001cfa0943',
        name: 'Stellar Sauce X-100',
        type: 'sauce',
        proteins: 50,
        fat: 22,
        carbohydrates: 11,
        calories: 14,
        price: 80,
        image: 'https://example.com/sauce.png',
        image_mobile: 'https://example.com/sauce-mobile.png',
        image_large: 'https://example.com/sauce-large.png'
      };

      const newState = constructorSlice(baseState, addIngredient(sauceIngredient));
      
      expect(newState.constructorItems.ingredients).toHaveLength(1);
      expect(newState.constructorItems.ingredients[0]).toEqual({
        ...sauceIngredient,
        id: expect.any(String)
      });
    });

    test('should handle adding multiple ingredients', () => {
      let state = baseState;
      const ingredients = [
        {
          _id: '643d69a5c3f7b9001cfa0943',
          name: 'Stellar Sauce X-100',
          type: 'sauce',
          proteins: 50,
          fat: 22,
          carbohydrates: 11,
          calories: 14,
          price: 80,
          image: 'https://example.com/sauce.png',
          image_mobile: 'https://example.com/sauce-mobile.png',
          image_large: 'https://example.com/sauce-large.png'
        },
        {
          _id: '643d69a5c3f7b9001cfa0944',
          name: 'Space Patty Supreme',
          type: 'main',
          proteins: 100,
          fat: 40,
          carbohydrates: 20,
          calories: 420,
          price: 150,
          image: 'https://example.com/patty.png',
          image_mobile: 'https://example.com/patty-mobile.png',
          image_large: 'https://example.com/patty-large.png'
        }
      ];

      ingredients.forEach(ingredient => {
        state = constructorSlice(state, addIngredient(ingredient));
      });

      expect(state.constructorItems.ingredients).toHaveLength(2);
      expect(state.constructorItems.ingredients.map(i => i.name)).toEqual([
        'Stellar Sauce X-100',
        'Space Patty Supreme'
      ]);
    });

    test('should replace existing bun when adding new bun', () => {
      const initialBun = {
        _id: '643d69a5c3f7b9001cfa093c',
        name: 'Standard Bun',
        type: 'bun',
        proteins: 80,
        fat: 24,
        carbohydrates: 53,
        calories: 420,
        price: 100,
        image: 'https://example.com/bun1.png',
        image_mobile: 'https://example.com/bun1-mobile.png',
        image_large: 'https://example.com/bun1-large.png'
      };

      const newBun = {
        _id: '643d69a5c3f7b9001cfa093d',
        name: 'Premium Bun',
        type: 'bun',
        proteins: 90,
        fat: 26,
        carbohydrates: 55,
        calories: 440,
        price: 120,
        image: 'https://example.com/bun2.png',
        image_mobile: 'https://example.com/bun2-mobile.png',
        image_large: 'https://example.com/bun2-large.png'
      };

      let state = constructorSlice(baseState, addIngredient(initialBun));
      state = constructorSlice(state, addIngredient(newBun));

      expect(state.constructorItems.bun).toEqual({
        ...newBun,
        id: expect.any(String)
      });
    });
  });

  describe('removeIngredient action tests', () => {
    test('should remove specified ingredient by id', () => {
      const ingredient = {
        _id: '643d69a5c3f7b9001cfa0944',
        name: 'Space Patty Supreme',
        type: 'main',
        proteins: 100,
        fat: 40,
        carbohydrates: 20,
        calories: 420,
        price: 150,
        image: 'https://example.com/patty.png',
        image_mobile: 'https://example.com/patty-mobile.png',
        image_large: 'https://example.com/patty-large.png'
      };

      let state = constructorSlice(baseState, addIngredient(ingredient));
      const ingredientId = state.constructorItems.ingredients[0].id;
      
      state = constructorSlice(state, removeIngredient(ingredientId));
      
      expect(state.constructorItems.ingredients).toHaveLength(0);
    });

    test('should handle removing non-existent ingredient', () => {
      const state = constructorSlice(baseState, removeIngredient('non-existent-id'));
      expect(state).toEqual(baseState);
    });
  });

  describe('ingredient movement tests', () => {
    const stateWithIngredients = {
      ...initialState,
      constructorItems: {
        bun: null,
        ingredients: [
          {
            _id: '1',
            id: '1',
            name: 'Ingredient 1',
            type: 'main',
            proteins: 10,
            fat: 10,
            carbohydrates: 10,
            calories: 100,
            price: 50,
            image: 'url1',
            image_mobile: 'url1-mobile',
            image_large: 'url1-large'
          },
          {
            _id: '2',
            id: '2',
            name: 'Ingredient 2',
            type: 'main',
            proteins: 20,
            fat: 20,
            carbohydrates: 20,
            calories: 200,
            price: 100,
            image: 'url2',
            image_mobile: 'url2-mobile',
            image_large: 'url2-large'
          },
          {
            _id: '3',
            id: '3',
            name: 'Ingredient 3',
            type: 'main',
            proteins: 30,
            fat: 30,
            carbohydrates: 30,
            calories: 300,
            price: 150,
            image: 'url3',
            image_mobile: 'url3-mobile',
            image_large: 'url3-large'
          }
        ]
      }
    };

    test('should move ingredient up correctly', () => {
      const state = constructorSlice(stateWithIngredients, moveIngredientUp(1));
      expect(state.constructorItems.ingredients.map(i => i.name)).toEqual([
        'Ingredient 2',
        'Ingredient 1',
        'Ingredient 3'
      ]);
    });

    test('should move ingredient down correctly', () => {
      const state = constructorSlice(stateWithIngredients, moveIngredientDown(1));
      expect(state.constructorItems.ingredients.map(i => i.name)).toEqual([
        'Ingredient 1',
        'Ingredient 3',
        'Ingredient 2'
      ]);
    });

    test('should handle moving first ingredient', () => {
      const state = constructorSlice(stateWithIngredients, moveIngredientUp(0));
      const expectedOrder = ['Ingredient 3', 'Ingredient 1', 'Ingredient 2'];
      expect(state.constructorItems.ingredients.map(i => i.name)).toEqual(expectedOrder);
    });

    test('should handle moving last ingredient', () => {
      const lastIndex = stateWithIngredients.constructorItems.ingredients.length - 1;
      const state = constructorSlice(stateWithIngredients, moveIngredientDown(lastIndex));
      expect(state.constructorItems.ingredients).toEqual([
        stateWithIngredients.constructorItems.ingredients[0],
        stateWithIngredients.constructorItems.ingredients[1],
        undefined,
        stateWithIngredients.constructorItems.ingredients[2]
      ]);
    });
  });

  describe('order management tests', () => {
    test('should handle order pending state', () => {
      const state = constructorSlice(baseState, {
        type: orderBurger.pending.type
      });
      
      expect(state.loading).toBe(true);
      expect(state.orderRequest).toBe(true);
      expect(state.error).toBeNull();
    });

    test('should handle order fulfillment', () => {
      const orderData = {
        order: {
          number: 12345,
          status: 'created',
          name: 'Space Burger'
        }
      };

      const state = constructorSlice(baseState, {
        type: orderBurger.fulfilled.type,
        payload: orderData
      });

      expect(state.loading).toBe(false);
      expect(state.orderRequest).toBe(false);
      expect(state.error).toBeNull();
      expect(state.orderModalData).toEqual(orderData.order);
      expect(state.constructorItems).toEqual({
        bun: null,
        ingredients: []
      });
    });

    test('should handle order rejection', () => {
      const error = 'Network error';
      const state = constructorSlice(baseState, {
        type: orderBurger.rejected.type,
        error: { message: error }
      });

      expect(state.loading).toBe(false);
      expect(state.orderRequest).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('modal and request management tests', () => {
    test('should handle reset modal action', () => {
      const mockOrder: TOrder = {
        _id: '12345',
        number: 12345,
        status: 'created',
        name: 'Space Burger',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ingredients: ['ingredient1', 'ingredient2']
      };

      const stateWithModal = {
        ...baseState,
        orderModalData: mockOrder
      };

      const state = constructorSlice(stateWithModal, resetModal());
      expect(state.orderModalData).toBeNull();
    });

    test('should handle set request action', () => {
      const state = constructorSlice(baseState, setRequest(true));
      expect(state.orderRequest).toBe(true);

      const nextState = constructorSlice(state, setRequest(false));
      expect(nextState.orderRequest).toBe(false);
    });
  });
});
