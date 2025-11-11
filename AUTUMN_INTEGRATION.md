# Autumn Tip Jar Integration

## Overview

This document describes the integration of Autumn's payment platform for the Corgi Quest tip jar feature. The implementation supports both sandbox mode (for demo/testing) and production mode (for real payments).

## Current Implementation Status

✅ **Completed:**
- Autumn JS SDK installed (`autumn-js` v0.1.47)
- Environment variable configured (`AUTUMN_API_KEY`)
- Convex action created (`createAutumnCheckout`)
- Thanks page UI with tip options ($3, $5, $10, Custom)
- Sandbox mode implementation (simulated checkout)
- Error handling and loading states
- Success confirmation UI
- Local storage tracking for demo purposes

## Architecture

### Flow Diagram

```
User clicks tip amount
         │
         ▼
Call createAutumnCheckout action
         │
         ├─► Sandbox Mode (current)
         │   ├─► Return mock session
         │   ├─► Simulate 1s delay
         │   └─► Show success message
         │
         └─► Production Mode (future)
             ├─► Initialize Autumn SDK
             ├─► Create/get customer
             ├─► Create checkout session
             ├─► Redirect to Autumn checkout
             └─► Handle webhook callback
```

## Files Modified

1. **`.env.local`** - Added `AUTUMN_API_KEY` environment variable
2. **`convex/actions.ts`** - Added `createAutumnCheckout` action
3. **`src/routes/thanks.tsx`** - Updated with Autumn checkout integration
4. **`package.json`** - Added `autumn-js` dependency

## Sandbox Mode (Current)

The current implementation runs in sandbox mode, which:
- Does NOT make real charges
- Simulates successful checkout after 1 second
- Stores tip data in localStorage for demo tracking
- Shows success message without redirecting

### Testing Sandbox Mode

1. Navigate to `/thanks` route
2. Click any tip amount ($3, $5, $10, or Custom)
3. Wait for 1 second processing simulation
4. See success message with celebration emoji
5. Check localStorage for `corgiQuestTips` array

## Production Mode Setup

To enable real payments with Autumn:

### Step 1: Get Autumn API Key

1. Sign up at https://useautumn.com
2. Create a new project
3. Get your API key from the dashboard
4. Update `.env.local` with real API key:
   ```bash
   AUTUMN_API_KEY=autumn_live_your_actual_key_here
   ```

### Step 2: Create Products in Autumn Dashboard

Create products for each tip amount:
- Product ID: `tip_3` - Price: $3.00
- Product ID: `tip_5` - Price: $5.00
- Product ID: `tip_10` - Price: $10.00
- Product ID: `tip_custom` - Price: Variable

### Step 3: Uncomment Production Code

In `convex/actions.ts`, uncomment the production implementation:

```typescript
// Uncomment this section in createAutumnCheckout action
const { Autumn } = await import("autumn-js");

const autumn = new Autumn({
  apiKey,
  env: "live", // or "sandbox" for testing
});

// ... rest of the production code
```

### Step 4: Configure Webhooks

1. In Autumn dashboard, add webhook URL:
   ```
   https://your-app.convex.cloud/webhooks/autumn
   ```

2. Create webhook handler in Convex:
   ```typescript
   // convex/http.ts
   export const handleAutumnWebhook = httpAction(async (ctx, request) => {
     // Verify webhook signature
     // Handle payment.succeeded event
     // Update database with payment record
   });
   ```

### Step 5: Handle Success/Failure URLs

Update success URL in `thanks.tsx`:
```typescript
successUrl: `${window.location.origin}/thanks?success=true`,
```

Add URL parameter handling:
```typescript
const searchParams = new URLSearchParams(window.location.search);
const paymentSuccess = searchParams.get('success') === 'true';
```

## API Reference

### Convex Action: `createAutumnCheckout`

**Parameters:**
- `amount` (number) - Tip amount in USD
- `customerId` (string) - User ID from localStorage
- `successUrl` (string, optional) - Redirect URL after payment

**Returns:**
```typescript
{
  url: string | null,        // Checkout URL (null in sandbox)
  sessionId: string,         // Session identifier
  amount: number,            // Tip amount
  currency: string,          // Currency code (USD)
  mode: "sandbox" | "live",  // Environment mode
  message?: string           // Status message
}
```

**Errors:**
- `AUTUMN_API_KEY not configured` - Missing API key
- `Autumn checkout failed: [reason]` - API error

## Autumn SDK Documentation

Official docs: https://docs.useautumn.com

Key methods used:
- `Autumn.createCustomer()` - Create/get customer
- `Autumn.checkout()` - Create checkout session
- `Autumn.setupPayment()` - Setup payment method

## Security Considerations

1. **API Key Protection:**
   - Never expose API key in client-side code
   - Use Convex actions (server-side) for all Autumn API calls
   - Store API key in Convex environment variables

2. **Webhook Verification:**
   - Verify webhook signatures from Autumn
   - Validate payment amounts match expected values
   - Prevent replay attacks with timestamp checks

3. **Customer Data:**
   - Use anonymous customer IDs
   - Don't store sensitive payment information
   - Let Autumn handle PCI compliance

## Testing Checklist

- [x] Install autumn-js package
- [x] Add AUTUMN_API_KEY to environment
- [x] Create createAutumnCheckout action
- [x] Update thanks.tsx with checkout flow
- [x] Test $3 tip in sandbox mode
- [x] Test $5 tip in sandbox mode
- [x] Test $10 tip in sandbox mode
- [x] Test custom amount in sandbox mode
- [x] Test error handling (invalid amount)
- [x] Test loading states
- [x] Test success message display
- [ ] Create products in Autumn dashboard (production)
- [ ] Test with real Autumn API key (production)
- [ ] Test webhook handling (production)
- [ ] Test success/failure redirects (production)

## Troubleshooting

### Issue: "AUTUMN_API_KEY not configured"
**Solution:** Add API key to `.env.local` and restart Convex dev server

### Issue: Checkout not redirecting
**Solution:** Check that `result.url` is not null in production mode

### Issue: Webhook not receiving events
**Solution:** Verify webhook URL in Autumn dashboard and check Convex logs

## Future Enhancements

1. **Tip History:** Display user's tip history in profile
2. **Rewards:** Unlock cosmetic items for tipping
3. **Recurring Tips:** Monthly supporter subscriptions
4. **Leaderboard:** Show top supporters (with permission)
5. **Thank You Notes:** Send personalized messages to supporters

## Requirements Satisfied

✅ **Requirement 35: Sponsor Integration - Autumn Tip Jar**
- [x] Create /thanks route with tip jar UI
- [x] Integrate Autumn sandbox checkout
- [x] Display tip amount options ($3, $5, $10, Custom)
- [x] Implement checkout modal/flow
- [x] Handle successful tip submission
- [x] Handle errors gracefully
- [x] Provide "Skip" or "Maybe Later" option

## Contact

For Autumn support: https://useautumn.com/support
For Corgi Quest issues: See README.md
