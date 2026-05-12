# UI Upgrade: Minimal Material Kit React

## Objective
Update the frontend UI to match the look and feel of the `minimal-ui-kit/material-kit-react` dashboard. This includes adopting its color palette, typography, shadows, and layout components.

## Key Files & Context
- `frontend/src/App.tsx`: Theme configuration.
- `frontend/src/components/Layout.tsx`: Side navigation and top bar.
- `frontend/src/pages/Dashboard.tsx`: Main overview page.
- `frontend/src/pages/Transactions.tsx`: Transaction management.
- `frontend/src/pages/Categories.tsx`: Category management.

## Implementation Steps

### 1. Theme Configuration (`frontend/src/App.tsx`)
- Update the `createTheme` configuration with:
  - **Colors**: Use the primary (`#1877F2`), success (`#22C55E`), error (`#FF5630`), and grey palette from Minimal UI.
  - **Typography**: Set default font family to `"Public Sans", sans-serif` (as a fallback for DM Sans) and update headings weights.
  - **Components**: Add custom style overrides for `MuiButton`, `MuiCard`, `MuiPaper`, and `MuiTableCell` to match the minimalist aesthetic (rounded corners, subtle shadows).
  - **Shadows**: Implement the custom shadow system.

### 2. Layout Refactoring (`frontend/src/components/Layout.tsx`)
- Redesign the Sidebar (Drawer):
  - Increase padding and use rounded active states.
  - Use a cleaner "logo" area.
  - Make the background slightly off-white (`#F9FAFB`).
- Redesign the AppBar:
  - Transparent or solid white with a very subtle border.
  - Remove heavy shadows.

### 3. Page Improvements
- **Dashboard (`Dashboard.tsx`)**:
  - Update summary cards with custom shadows and larger typography.
  - Refine charts with Minimal UI colors.
- **Transactions (`Transactions.tsx`) & Categories (`Categories.tsx`)**:
  - Use `Card` as a container for tables.
  - Improve table header styling.
  - Use stylized buttons for actions.

## Verification & Testing
- Manual inspection of the UI in the browser.
- Ensure all pages are responsive.
- Verify that theme colors are consistent across all components.
