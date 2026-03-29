/**
 * Subscription Slice
 * Redux Toolkit slice for managing subscription state and API calls
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  SubscriptionState,
  ActiveSubscription,
  SubscriptionPlan,
  BillingHistoryItem,
  ChangePlanPayload,
  ProcessPaymentPayload,
  ProrationPreview,
  PaymentMethod,
} from '@/types/subscription';
import { mockSubscriptionAPI } from '@/services/mockSubscriptionAPI';

const initialState: SubscriptionState = {
  currentSubscription: null,
  availablePlans: [],
  billingHistory: [],
  paymentMethods: [],
  loading: false,
  error: null,
  prorationPreview: null,
};

/**
 * Fetch current user's subscription details
 */
export const fetchSubscription = createAsyncThunk(
  'subscription/fetchSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const subscription = await mockSubscriptionAPI.getCurrentSubscription();
      return subscription;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch subscription');
    }
  }
);

/**
 * Fetch all available subscription plans
 */
export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const plans = await mockSubscriptionAPI.getAvailablePlans();
      return plans;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch plans');
    }
  }
);

/**
 * Fetch billing history
 */
export const fetchBillingHistory = createAsyncThunk(
  'subscription/fetchBillingHistory',
  async (_, { rejectWithValue }) => {
    try {
      const history = await mockSubscriptionAPI.getBillingHistory();
      return history;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch billing history');
    }
  }
);

/**
 * Change subscription plan (upgrade/downgrade)
 */
export const changePlan = createAsyncThunk(
  'subscription/changePlan',
  async (payload: ChangePlanPayload, { rejectWithValue }) => {
    try {
      const updatedSubscription = await mockSubscriptionAPI.changePlan(
        payload.newPlanId,
        payload.billingCycle
      );
      return updatedSubscription;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to change plan');
    }
  }
);

/**
 * Cancel subscription
 */
export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const updatedSubscription = await mockSubscriptionAPI.cancelSubscription();
      return updatedSubscription;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel subscription');
    }
  }
);

/**
 * Process payment for new subscription or plan change
 */
export const processPayment = createAsyncThunk(
  'subscription/processPayment',
  async (payload: ProcessPaymentPayload, { rejectWithValue }) => {
    try {
      const subscription = await mockSubscriptionAPI.processPayment(
        payload.planId,
        payload.billingCycle,
        payload.paymentDetails
      );
      return subscription;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Payment failed');
    }
  }
);

/**
 * Get proration preview for plan change
 */
export const getProrationPreview = createAsyncThunk(
  'subscription/getProrationPreview',
  async (payload: ChangePlanPayload, { rejectWithValue }) => {
    try {
      const preview = await mockSubscriptionAPI.getProrationPreview(
        payload.newPlanId,
        payload.billingCycle
      );
      return preview;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get proration preview');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProrationPreview: (state) => {
      state.prorationPreview = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Subscription
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action: PayloadAction<ActiveSubscription | null>) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Plans
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action: PayloadAction<SubscriptionPlan[]>) => {
        state.loading = false;
        state.availablePlans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Billing History
    builder
      .addCase(fetchBillingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillingHistory.fulfilled, (state, action: PayloadAction<BillingHistoryItem[]>) => {
        state.loading = false;
        state.billingHistory = action.payload;
      })
      .addCase(fetchBillingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Change Plan
    builder
      .addCase(changePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePlan.fulfilled, (state, action: PayloadAction<ActiveSubscription>) => {
        state.loading = false;
        state.currentSubscription = action.payload;
        state.prorationPreview = null;
      })
      .addCase(changePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Cancel Subscription
    builder
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action: PayloadAction<ActiveSubscription>) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Process Payment
    builder
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action: PayloadAction<ActiveSubscription>) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Proration Preview
    builder
      .addCase(getProrationPreview.pending, (state) => {
        state.error = null;
      })
      .addCase(getProrationPreview.fulfilled, (state, action: PayloadAction<ProrationPreview>) => {
        state.prorationPreview = action.payload;
      })
      .addCase(getProrationPreview.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearProrationPreview } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
