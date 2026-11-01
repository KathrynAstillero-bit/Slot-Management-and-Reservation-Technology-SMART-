# Slot Management and Reservation Technology (SMART)

CCDI Portal — Slot Management UI

A Vite + React interface following the dark blue sidebar and white panels in the supplied video. Includes Student, Cashier, Accounting, and Admin views and reusable components.

## Open in VS Code

1. Open this folder in Visual Studio Code.
2. Run `npm install` if dependencies have not been installed.
3. Run `npm run dev`.
4. Open http://127.0.0.1:5173.

You can also select **Terminal → Run Task → Start Slot Management**.

Requires Node.js 22.13 or later. Node 24 is recommended.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production website in `dist/` |
| `npm run preview` | Preview the production build locally |

## Interface views

- **Student:** choose Cashier or Accounting, choose a service, then select an available date and time. The reservation screen shows a sample queue number and QR ticket.
- **Cashier:** switch Cashier availability and individual services on or off, manage displayed dates and times, and preview the office queue.
- **Accounting:** manage Accounting availability, services, and the office queue.
- **Admin:** oversee both offices and preview account management.

Unavailable offices, services, dates, and times are disabled and light gray. The calendar appears after a service is selected. Changing a selection clears later choices.

## UI demonstration

Choose an account type on the sign-in screen, then enter these public demo credentials. **Use demo credentials** fills the fields for the selected account.

| Account | Student ID or email | Password |
| --- | --- | --- |
| Student | `2026-01-123` | `SlotStudent!2026` |
| Cashier | `cashier@demo.local` | `SlotCashier!2026` |
| Accounting | `accounting@demo.local` | `SlotAccounting!2026` |
| Admin | `admin@demo.local` | `SlotAdmin!2026` |

The login uses a diagonal split panel inspired by the latest reference video. Choose Create an account to preview the animated registration panel, then return to Sign in. Registration is a visual demonstration and does not create new credentials. On phones the panels stack, all fields remain visible, and reduced-motion preferences are respected.

To try availability changes, sign in to an office account, change a switch, log out, and sign in as Student in the same browser. Data persists through refreshes. A different browser or origin starts with separate demo data. Clear this site's browser storage to reset all demo data.

This project is a frontend demonstration. Account selection, reservations, queue numbers, and QR verification demonstrate the intended user experience. There is no authentication server, shared database, or real ticket validation. Any browser storage is only for this device. Connect a backend before using the interface for actual student reservations.

## Structure

- `src/components/` — paired JSX and CSS files for each screen and reusable component.
- `src/App.jsx` and `src/App.css` — application routing, state, loading, and toasts.
- `src/styles.css` — shared foundations and reusable controls.
- `STYLE_GUIDE.md` — a map of each screen and its matching JSX/CSS files.
- `vite.config.js` — Vite configuration.
- `.vscode/` — startup/build tasks and optional extension suggestions.
- `public/assets/` — supplied theme image and transparent CCDI logo.

## Help Center and navigation

Help Center is available from sign-in and every account view. Search FAQs, filter categories, open answers, and jump to the relevant feature. The floating glass navbar, compact side rail, and phone navigation dock provide access to the existing features.

## Phone layout

The interface has a slide-out navigation menu, stacked booking panels, responsive calendars, large touch controls, and horizontally scrollable tables. Phone inputs use 16px text to prevent automatic form zoom. The UI was checked at 390px width.

Dependencies include React, Lucide icons, and QRCode. Vite handles development and production builds.


## Log in, sliding Sign in, and recovery previews

**Log in** uses the student ID (or staff username) and password. Select **Try a demo account** to fill the public credentials, then **Log in**.

**Sign in** opens the sliding account-creation panel with full name, student ID, email, password, password confirmation, and an image CAPTCHA. Type the displayed six letters and numbers; either uppercase or lowercase is accepted. The refresh control creates a new challenge and clears the previous response. Incorrect entries and mismatched passwords prevent the registration preview from completing. No account is created.

Forgot password previews a temporary-password email after entering an address and the image CAPTCHA. It sends no email, stores no recovery address, and does not change the demo password.

These frontend CAPTCHA and authentication controls demonstrate the UI only. A live implementation needs backend authentication, email delivery, expiry, rate limits, and CAPTCHA validation. The full institute name appears in the headers. The school-details footer appears only in signed-in workspaces.


## Main portal appearance

Choose **Light** or **Dark** under **Appearance** at the bottom of the sidebar. In the compact desktop rail the same controls appear as sun and moon icons; expand the rail to see their labels. On phones, open the main menu. The preference is saved in this browser and restored after refresh or logging back in.

Dark mode uses a lighter slate-blue navigation sidebar against a darker workspace. Colors cover dashboard cards, booking calendars and availability states, reservations, profile and balance forms, Help Center, staff screens, dialogs, and the school footer. Login keeps its own blue-glass theme. Print styles stay light and QR codes retain a white background.

The dark palette is scoped to the signed-in shell. After changing screen colors, run **node scripts/generate-dark-theme.cjs** before **npm run build** to regenerate **src/components/DarkTheme.css**. The generator uses the PostCSS version bundled with the installed build dependencies. Sidebar appearance-control layout is in **src/components/Appearance.css**.

## Simplified dashboard and campus glass layout

The main portal uses the enhanced campus image with a shared glass workspace in light and dark modes. The darker mode keeps a lighter slate-blue sidebar. Duplicate desktop navigation links were removed; the header keeps the school identity and account menu, while mobile retains its shortcut dock. Main text uses at least 14px type, with 16px form text and larger section headings.

Student dashboard summaries show upcoming visits, completed visits, and available offices. Staff summaries show today’s waiting, checked-in, and completed visits. Fixed sample balance/document cards, decorative ticket graphics, repeated slogans, and the empty activity chart were removed. Balance inquiry remains accessible from the student sidebar. Booking, reservations, availability, verification, profile, and Help Center remain available.
