# Add Public Landing Page for SmartPG & Mess

## Goal Description
Create a premium SaaS‑styled landing page for "SmartPG & Mess" at the root route `/`. The page is public for unauthenticated visitors and redirects authenticated users to their appropriate dashboards (owner → `/dashboard`, member → `/member/dashboard`). Existing routes, authentication, UI, and backend must remain unchanged.

## User Review Required
> [!IMPORTANT]
> Confirm the location for the new landing page component (e.g., `src/pages/landing/LandingPage.jsx`). Also confirm whether any shared layout components (Header, Footer) should be reused.

## Open Questions
> [!WARNING]
> - Do you prefer the landing page to be a standalone component or to wrap existing layout components?
> - Should the landing page be responsive using MUI Grid or custom CSS?

## Proposed Changes
---
### [MODIFY] `src/routes/AppRoutes.jsx`
- Import the new `LandingPage` component.
- Replace the existing `/` redirect route (currently `<Navigate to="/dashboard" />`) with a public route rendering `<LandingPage />`.
- Ensure the new route is placed before protected routes.

### [NEW] `src/pages/landing/LandingPage.jsx`
- Implements the hero, features, how‑it‑works, user‑type, why‑smartpg, CTA, and footer sections as described.
- Uses MUI components (`Box`, `Typography`, `Button`, `Grid`, `Card`) to match the app’s blue/white palette, rounded cards, and button styles.
- Utilises `useAuth` to detect authentication; if authenticated, redirects based on `role` (`owner` → `/dashboard`, `member` → `/member/dashboard`).
- Buttons "Get Started" and "Login" navigate to `/login`.

### [NEW] `src/pages/landing/landing.css` (optional)
- Scoped CSS for any custom styles not covered by MUI theme (e.g., background gradients, section spacing).

## Verification Plan
### Automated Tests
- Run `npm run dev` and visit `/` as a guest: landing page should render.
- Manually set `localStorage` token and `role` to `owner`/`member`, refresh `/`: should redirect to the correct dashboard.
- Click "Get Started" and "Login" buttons: ensure navigation to `/login`.
- Verify existing routes (`/login`, `/dashboard`, `/member/dashboard`, etc.) still function.

### Manual Verification
- Test on desktop, tablet, and mobile viewports for responsiveness.
- Visual check that colors, typography, rounded cards, and button styles align with the existing UI.
- Confirm no console errors or broken imports.

---
*Please review the plan and answer the open questions or approve to proceed.*
