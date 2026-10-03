# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `src/components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

## Date pricing and holiday quotes

Saved tour packages expose **Date & seasonal prices** for individual passenger/private rates,
single dates, inclusive ranges and weekday rules. Blank amounts keep defaults; zero is free.
Rules can be edited or deactivated with version checks. Holiday **Record quote** requires a
PDF/JPEG/PNG and exposes an authenticated download in **Quote history**.

The backend flow and migration contract is maintained in
[DATE_PRICING_AND_QUOTE_ATTACHMENTS.md](../skyland-backend/docs/DATE_PRICING_AND_QUOTE_ATTACHMENTS.md).
Deploy backend Flyway V35/V36 before this console update.

## Tour content and reviews

Tour and holiday package listings support category filters. The star action opens a product's
review page (`/tours/:id/reviews` or `/holiday-packages/:id/reviews`), where staff can publish
guest reviews with ratings from 1 to 5. Reviews appear on the website for published products.

Tour inclusions, exclusions, and terms use rich text editors and retain existing plain text
content. Attraction, hot tour, hotel pickup, and badge logo inputs are hidden; existing values
are preserved when editing. The backend accepts rich text sections up to 20,000 characters.


hello