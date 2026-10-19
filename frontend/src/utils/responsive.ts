/**
 * Spread into a TableCell's sx to hide that column on phones (xs) and show it from tablets (sm) up.
 * Use it on the header cell and on every body cell of the column, so they stay aligned.
 */
export const HIDE_ON_PHONE = { display: { xs: "none", sm: "table-cell" } } as const;
