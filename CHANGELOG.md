# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-03-09

### Added
- Dynamic site settings in the Admin panel.
- Product image uploads to Supabase Storage.
- WhatsApp integration for checkout routing.
- Initial database configuration (`database.sql`).
- Project disclaimer in README.
- JWT-based robust authentication for the Admin panel.

### Changed
- Refactored layout for Next.js Server/Client component separation.
- Redesigned Checkout and Admin UI with a premium dark theme.
- Localized storefront content to Indonesian.
- Replaced UI emojis with Lucide-react icons.

### Fixed
- Cart item count hydration errors.
- Async Component layout errors.
- Admin authentication and UI layout alignment issues.
- Secured previously exposed admin API routes (`/api/admin/*`) with JWT middleware.
