# Where to edit each screen

Each JSX file has its own CSS file beside it. The JSX imports that CSS directly.

| Screen or component | JSX | CSS |
| --- | --- | --- |
| App loading, toast, and public help wrapper | `src/App.jsx` | `src/App.css` |
| Navigation, sidebar, profile menu, and shared glass shell | `src/components/Shell.jsx` | `src/components/Shell.css` |
| Sign in and Create account | `src/components/Login.jsx` | `src/components/Login.css` |
| Dashboard cards and activity | `src/components/Dashboard.jsx` | `src/components/Dashboard.css` |
| Office selection, services, calendar, and booking times | `src/components/Booking.jsx` | `src/components/Booking.css` |
| Availability, queue, verification, and account management | `src/components/Staff.jsx` | `src/components/Staff.css` |
| Queue ticket and QR layout | `src/components/Ticket.jsx` | `src/components/Ticket.css` |
| Shared dialog layout and backdrop | `src/components/Modal.jsx` | `src/components/Modal.css` |
| Student profile | `src/components/Profile.jsx` | `src/components/Profile.css` |
| Balance inquiry | `src/components/Balance.jsx` | `src/components/Balance.css` |
| About the portal | `src/components/About.jsx` | `src/components/About.css` |
| Help Center and FAQs | `src/components/HelpCenter.jsx` | `src/components/HelpCenter.css` |

`src/styles.css` contains the shared foundation: color variables, reset, fonts, buttons, fields, panels, badges, and tables. Change this file when you want a shared control to look different across several screens. Screen-specific layout belongs in the matching component CSS file.

The application uses ordinary CSS, not CSS Modules. Component-specific class names help keep styles scoped to their screens.

For example, edit `Login.css` for the sliding authentication layout, `Booking.css` for calendar spacing, or `Ticket.css` for the printable ticket. Edit `Shell.css` for the floating navbar and phone dock.

Appearance controls live in `Shell.jsx` and `Appearance.css`. `DarkTheme.css` is a generated, screen-only palette scoped to the signed-in shell; update it with `node scripts/generate-dark-theme.cjs` after adding screen colors. Edit the palette rules in that script rather than editing the generated file. Login visual styling is in `LoginTheme.css`, with layout in `Login.css`.

`Readability.css` defines the main portal type hierarchy and light-mode text contrast. `CampusGlass.css` adds the enhanced campus background and shared glass workspace across all signed-in screens and both appearance modes. Keep these imports after the generated dark palette. Dashboard cards use reservation/office data rather than sample financial or document statuses.

`src/BrandTheme.css` owns the shared navy, blue, cyan, coral, action gradient, and background references used by login and the main portal. The main campus photo keeps its natural colors; the shared glass workspace carries a faint blue/coral gradient. A fixed, centered cover layer fits the photo to the viewport independently of page length, including mobile. `SwitchControl.css` owns availability switch geometry and on/off contrast in both appearance modes. Keep it after the generated dark stylesheet.

Light mode carries cyan and coral gradients through the glass workspace and sidebar, while the campus photo stays natural. The login gradient is softened with a muted overlay and a campus photo (18% opacity on desktop, 14% on mobile). A soft outer shadow and translucent edge highlights keep the form panel prominent.

`BalanceLedger.css` defines matriculation spacing and payment status colors after the generated theme. Red marks unpaid installments due through the selected period; green marks fully settled installments; later unpaid installments stay neutral. `balanceSchedule.js` uses integer centavos and keeps the miscellaneous/registration fee in one installment to avoid double counting. The page uses clearly marked sample records and preview controls until school payment records are connected. Run `node scripts/check-balance.mjs` to verify assessment totals, due cutoffs, and payment states.

## Approved palette and navigation (October 29, 2026)
Use the user's reference palette throughout future work: red #D90B1A, deep red #8F101B, deep navy #061D33, navy #093552, slate #68899C, mist #CED9D8, warm white #F6F5EE. Navy and neutrals dominate; red is a restrained active/action accent. Avoid introducing bright cyan, purple, or coral as brand colors. Status colors remain semantic (green paid, red due). PaletteTheme.css is the final shared override, loaded by main.jsx after component styles. Keep login glass readable and campus imagery subdued. The collapsible sidebar remembers its state; a red indicator moves between selected rows. Mobile uses a rounded dock with a moving red top indicator and labels, with reduced-motion support. Reference screenshots provide static states, not exact timing.
The active VS Code project is C:/Users/KATHRYN  ANGEL/Desktop/Slot Management. Apply source changes to that copy as well as this Sites checkout before reporting them complete.

Student mobile navigation follows the raised-center reference: Home, Tickets, Book a slot (raised red plus), Profile, Help. Multiple services can be selected within one office, sharing a date/time and queue ticket; separate offices require separate reservations. This is a prototype assumption pending school policy. serviceIds stores the full selection and serviceId retains compatibility with older records. Count appointments, not services, against office capacity. Validate all requested services at submission and preserve the older singular record display. Run node scripts/check-multi-service.mjs after changing booking persistence.

Profile images are owned by App state, persisted at ccdi-profile-photo, and passed to Profile and Shell. Keep header and sidebar badges synchronized on upload and reload; storage events update other tabs. Initials are the fallback. Standard controls use 500 weight, supporting links (including Forgot password) use 400, and headings use 600. Shared button variants must use the approved palette in PaletteTheme.css.
