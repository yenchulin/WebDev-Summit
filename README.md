# WebDev Summit

A multi-step event registration application built with Vue 3, Quasar, and UnoCSS.

The application guides users through attendee information, session selection, add-ons, and order review while handling cross-step state, form validation, session conflicts, dynamic pricing, and submission flow.

## Features

### Attendee Registration

![attendee-info screenshot](https://github.com/yenchulin/WebDev-Summit/raw/main/doc/attendee-info.png)

- Collects attendee information including name, email, phone, company, and job title
- Supports optional shipping address
- Dynamically requires a shipping address when merchandise is selected
- Supports General, VIP, and Student ticket types

### Session Selection

![sessions screenshot](https://github.com/yenchulin/WebDev-Summit/raw/main/doc/sessions.png)

- Groups sessions by conference date
- Displays session information including speaker, time, track, and remaining capacity
- Prevents selection of sessions that have reached capacity
- Detects overlapping session selections during validation

### Add-ons

![add-ons screenshot](https://github.com/yenchulin/WebDev-Summit/raw/main/doc/add-ons.png)

- Groups add-ons into workshops, meal packages, and merchandise
- Detects workshop conflicts with selected sessions
- Supports merchandise sizes and quantity limits
- Displays a shipping notice when merchandise is selected
- Calculates the order total dynamically
- Applies the VIP discount to eligible workshops

### Review & Submission

![review screenshot](https://github.com/yenchulin/WebDev-Summit/raw/main/doc/review.png)

- Provides a complete summary before submission
- Displays item prices and the final total
- Allows users to return to previous steps and edit their selections
- Performs unified validation across all registration steps
- Navigates users to the relevant step when validation errors occur
- Displays a confirmation screen after successful submission

## Tech Stack

| Category        | Technologies     |
| --------------- | ---------------- |
| Framework       | Vue 3.5          |
| UI Framework    | Quasar 2.18      |
| Styling         | UnoCSS           |
| Language        | JavaScript       |
| Testing         | Vitest           |
| Date & Time     | Moment.js        |
| Code Quality    | ESLint, Prettier |
| Package Manager | Yarn             |

## Frontend Architecture

The application uses a component-based architecture with composables for shared state and business logic.

```text
src/
├── components/          # Reusable UI components
├── composables/         # Shared state and business logic
├── layouts/             # Application layouts
├── pages/               # Page-level views
├── mocks/               # Mock session and add-on data
└── ...
```

### State Management

Registration data is centralized in `useRegistrationWizard.js`, including:

- Attendee information
- Ticket selection
- Selected sessions
- Selected add-ons
- Pricing and derived values

UI-specific state remains local to individual components, such as the currently selected session date or add-on category.

This separation keeps shared registration state centralized while avoiding unnecessary global state for presentation-only concerns.

### Composables

The application extracts reusable logic into composables, including:

- `useRegistrationWizard.js`: shared registration state, pricing, and derived data
- `useWizardSteps.js`: step navigation and wizard flow

Derived values are primarily handled with Vue `computed` properties rather than manually synchronizing state with watchers.

## Key Frontend Challenges

### Cross-Step Validation

Validation is performed across the entire registration flow when the user submits the form.

The validation system:

1. Validates attendee information
2. Checks session conflicts
3. Checks workshop conflicts
4. Validates merchandise-related requirements
5. Identifies the affected step
6. Navigates the user back to the relevant step

This allows the wizard to preserve user input while still providing a unified validation experience.

### Session & Workshop Conflict Detection

Sessions and workshops contain time ranges that may overlap.

The conflict detection logic extracts the relevant time ranges, sorts them by start time, and compares overlapping intervals to identify conflicts.

Only the data required for comparison is extracted, keeping the business logic independent from the presentation layer.

### Dynamic Pricing

Order pricing is derived from the current registration state and includes:

- Ticket price
- Selected add-ons
- VIP workshop discount
- Quantity-based merchandise pricing

Pricing is centralized in the registration composable so that the same derived values can be consumed by the add-on and review steps.

### Component Reusability

Common UI patterns are extracted into reusable components, including:

- `InputField`
- `SessionCard`
- `AddonCard`
- `ButtonToggle`
- `ReviewBlock`
- `BaseButton`

This keeps page-level components focused on composition and user flow rather than UI implementation.

## Design System

The UI uses design tokens through UnoCSS rather than hardcoded color values.

Examples include:

```html
<div class="text-neutral bg-surface-l1 border border-neutral-muted"></div>
```

This keeps styling consistent with the provided design system and makes semantic visual changes easier to maintain.

## Getting Started

### Requirements

- Node.js 22.x
- Yarn 4.6+

### Installation

```bash
yarn
```

### Development

```bash
yarn dev
```

The development server runs at:

```text
http://localhost:9000
```

### Production Build

```bash
yarn build
```

## Testing

Unit tests are written with Vitest.

```bash
yarn test
```

## Development Process

This project was originally completed as a frontend engineering assessment.

The development process, architecture decisions, dependency choices, AI-assisted development, challenges, and potential improvements are documented in [PLAN.md](./PLAN.md).

AI tools were used as part of the development workflow for exploring implementation approaches and accelerating UI development. All generated code was reviewed, simplified, and manually verified before integration.
