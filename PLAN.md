# PLAN

## 1. Planning & Task Breakdown

I started by breaking the problem into four steps:

1. Attendee Info
2. Session Selection
3. Add-ons
4. Review & Submit

Given the requirement for cross-step validation, shared state, and flexible navigation, I decided to:

- Use a single route with internal step state
- Centralize shared state in a global composable
- Keep UI-specific state close to components

## 2. Key Decisions

### Why not use router-based steps?

I chose not to use route-based navigation (e.g. `/attendee-info`, `/sessions`) and instead used a single page with `QStepper` and a `currentStep` state.

Reasons:

- All steps share the same data, and validation needs to run across steps
- Keeping everything in one place avoids syncing issues between routes
- No need to persist or restore state when navigating between pages
- Simpler control over validation flow (especially on submit)
- Better UX for a wizard-style interaction (no page reload or route jump)

Since the number of steps is fixed and the flow is linear, using routing would add complexity without benefits.

---

### Stepper & Navigation

- Used `QStepper` with an internal `currentStep` to manage step transitions
- Extracted navigation logic into `useWizardSteps.js`

---

### State Management

I separated state into two categories:

#### Shared state (global)

Stored in `useRegistrationWizard.js`:

- attendee info
- selected sessions
- selected addons
- ticket type and pricing
- derived data

#### Local state (component-level)

Kept inside components:

- selected date (session filtering)
- selected category (addon filtering)

This keeps global state minimal while maintaining flexibility in UI.

---

### Data Structures

- **Sessions grouped by date:**

  ```js
  Record<string, Array>
  ```

- **Selected sessions:**

  ```js
  // ref object
  Set
  ```

- **Addons grouped by category:**

  ```js
  Record<string, Array>
  ```

- **Addon selection state:**
  Besides merchandise, the select status of workshop and meals category can be `quantity == 0 or 1`, which is easier for price calculation.

  ```js
  // reactive object
  Record<string, { quantity: Int, size: String })>
  ```

- **Derived selected addons** (for rendering in review step):

  ```js
  Array
  ```

---

### Time Conflict Handling

- Extracted selected session time ranges into a computed value
- Sorted by start time
- Compared adjacent sessions to detect overlap

This avoids exposing unnecessary data while keeping logic efficient.

---

### Validation Strategy

- Attendee errors stored as:

  ```js
  // reactive object
  Record<string, { required: string, format: string }>
  ```

  since there are two types of errors with email and phone (empty and format).

- Separate checks for each field and each type of error.
  ex. `isEmailRequired` for empty states and `isEmailFormatValid` for format errors.

- Validation is triggered on submit with `validateAttendeeInfo()`, which will update the reactive object and shown errors in Review step and input fields.

I did not expose the validation computed values for each field since real-time validation is not required.

---

### Pricing & Business Logic

- Centralized in shared composable
- VIP discount implemented via:

  ```js
  ticketType.id === 'VIP'
  ```

  At first I want to check it with `PERK.WORKSHOP_DISCOUNT` since there may be other ticket type in the future that has this PERK besides VIP. However, I found PERK is not exposed to public, I stayed with `ticketType.id === VIP`.

---

### Component Architecture

Extracted reusable components to keep maintainability:

- InputField.vue
- SessionCard.vue
- AddonCard.vue
- ButtonToggle.vue
- ReviewBlock.vue
- BaseButton.vue

---

### Styling & Design

- Added missing semantic design tokens that appears in figma
- Since Figma Dev Mode was not available:
  I used screenshots, and ask AI to generate initial styles, then manually verified the styles.

---

### Routing

- MainLayout (to reuse header UI)
  - Home
  - Wizard
  - Success
  - Error (to handle not found urls)

  Created a separate success page instead of staying in the wizard stepper because:
  - Does not share the stepper
  - Refreshing the success page should not navigate to wizard step 1

---

### Submission Flow

1. Validate input and sessions
2. Show loading state
3. Resolve → navigate to success page with confirmation code as params
   Reject → show error dialog

After success, state is reset for the next registration.

## 3. Dependencies

- moment.js: for datetime parsing
- eslint + prettier: maintain code quality

## 4. AI Tool Usage

### Usage

- Check architecture direction
- Convert design screenshots into code, prompts like:

  ```text
  Code me the screen above according to the figma design file I uploaded. Do not hard code hex color, please use the predefined design tokens. If possible, for typography, use design tokens as well. Use q-icon for the icon. If you need to know more about the project check @README.md
  ```

- Exploring implementation options

### What worked

- Speeding up UI coding
- Providing initial structure

### What didn’t

- Complex or redundant code
- Styling inaccuracies

### How to solve

- Reviewed all generated code before using
- Cross-checked with documentation
- Simplified code when it is over-engineered

## 5. Challenges & Solutions

### Figma Dev Mode unavailable

- Could not enable MCP server due to Dev Seat restriction
- Tried a third-party plugin but could not connect

Workaround:

- screenshots + manual verification

### Addon State Design

- Needed to support quantity and possibly size

Solution:

- switched from Set to reactive object

### Time conflict detection

- Needed a simple and reliable way to detect overlap

Solution:

- Extracted minimal data to only time ranges
- Used sorting + overlap comparison

## 6. Improvements

- Migrate to TypeScript
- Add type safety and nullable check for composables
- Support multi-size selection for merchandise (M x 1 and S x 1)
- Support i18n
- Session filters (sort by the same track)
- Standardize coding styles (sort imports, sort class names)

Improve UX:

- Support responsive design
- Font style
- Stepper UI
- Fix design token inconsistencies
