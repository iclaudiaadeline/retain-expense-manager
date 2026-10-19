/**
 * hides a table column on phones and shows it on tablets and larger screens.
 * Applys this to both the column header and its cells to keep the table aligned.
 */
 
export const HIDE_ON_PHONE = { display: { xs: "none", sm: "table-cell" } } as const;
