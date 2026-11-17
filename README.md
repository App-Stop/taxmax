# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Profiles and campaign links

The customer profile reads `GET /users/me` and saves personal information through
`PATCH /users/me`. Photos use the backend's presigned storage upload and profile
picture removal endpoints. SSNs are displayed and cached using only their last four digits.

Campaign QR codes encode the same URL shown by Copy Link, Download PNG, and Print:
`https://<deployed-site>/?campaign=<slug>`. Campaign visits open the public TaxMax
landing page, including for signed-in visitors. Set `VITE_PUBLIC_SITE_URL` before
building if the public website uses a different host from the admin portal.
The backend currently has no campaign or referral API; campaign records and
statistics still use the existing frontend data.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
