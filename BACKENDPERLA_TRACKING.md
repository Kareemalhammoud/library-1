# BackendPerla Backend Tracking

Branch: `BackendPerla`

## Scope

- Backend work for `BookDetail`.
- Backend work for the Study Room flow in `Services`.
- Keep frontend/backend integration notes visible for review.

## Completed

- Created branch `BackendPerla` from `perla`.
- Connected List View to backend search/filter/sort parameters while preserving client-side pagination and responsive layout.
- Connected Book Detail to real backend single-book data, reviews, favorites, borrowing, and reservations.
- Added Study Room booking persistence to the Express backend.
- Added Help Request persistence for the existing Services chat form.
- Added backend routes matching the existing frontend fallback paths:
  - `POST /api/study-room-bookings`
  - `GET /api/study-room-bookings`
  - `PATCH /api/study-room-bookings/:id/status`
  - `POST /api/services/study-rooms`
  - `GET /api/services/study-rooms`
  - `PATCH /api/services/study-rooms/:id/status`
  - `POST /api/help-requests`
  - `GET /api/help-requests`
  - `PATCH /api/help-requests/:id/status`
  - `POST /api/services/help-requests`
  - `GET /api/services/help-requests`
  - `PATCH /api/services/help-requests/:id/status`
- Added database tables:
  - `study_room_bookings`
  - `help_requests`
- Added direct BookDetail borrow support at `POST /api/books/:id/borrow`.
- Added direct BookDetail reserve support at `POST /api/books/:id/reserve`.
- Added backend list filtering support for `search`, `genre`, `language`, `campus`, `availability`, and `sort`.
- Reused the existing `loansController.createLoan` rules for both `/api/loans` and `/api/books/:id/borrow`.
- Added authenticated reservation persistence with the `reservations` table.
- Pointed root `npm run dev:api` to `server/server.js`, the MySQL-backed Express API.
- Made `server/server.js` load `server/.env` consistently even when started from the repo root.
- Updated `src/services/libraryApi.js` so Services calls a backend by default, matching the rest of the app.
- Supported both `VITE_API_BASE_URL` and the documented `VITE_API_BASE` for Services API calls.
- Preserved earlier Services page fixes from this branch:
  - Fixed broken Services JSX structure.
  - Added Services prop validation.
  - Normalized Services routes to lowercase.

## Notes

- Study Room bookings are public because the current form collects `studentId` and does not require login.
- Book borrowing remains authenticated because loans belong to a logged-in user.
- Book reservations remain authenticated for the same reason: reservations belong to a logged-in user.
- The legacy `backend/server.js` file is still present as a mock API, but `server/` is now the active backend used by `npm run dev:api`.

## Verification

- Passed: `npm.cmd run build`.
- Passed: `npx.cmd eslint src/pages/Services --ext js,jsx --report-unused-disable-directives --max-warnings 0`.
- Passed: `node --check` on changed backend route/controller/server files.
- Passed: focused ESLint for `src/pages/Services`, `src/pages/ListView`, `src/pages/BookDetail`, `src/utils/api.js`, and `src/services/libraryApi.js`.
- Backend dependencies installed in `server/` with `npm.cmd install`.
- Attempted `node scripts/apply-schema.js` from `server/`, but schema application needs real DB credentials in `server/.env`; current env loaded zero DB variables and MySQL rejected an empty user.
