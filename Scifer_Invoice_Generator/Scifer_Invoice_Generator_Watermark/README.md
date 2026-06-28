# Scifer Invoice Generator — Footer & Alignment Fix - Stable PDF Edition

Open `index.html` in Chrome or Microsoft Edge.

## Main updates

- **Save as PDF** creates a separate, fixed A4 PDF using the same measurements every time. It does not use the browser print layout, so the invoice details panel, table, totals, signature, and footer stay aligned.
- **Print Invoice** remains separate and opens the normal printer dialog.
- Removed **Due Date** and **Payment Terms** from both the form and invoice.
- Replaced the two customer address lines with one **Customer Address** field.
- Replaced the multi-column footer with one large office address and a bigger, clearer contact line.
- Added invoice terms appropriate for electronic products, rentals, installation, and services. The terms remain editable.

## Using the PDF button

Fill in the invoice and select **Save as PDF**. The browser downloads the PDF directly. No printer dialog is shown.

## Using the print button

Select **Print Invoice** for a physical print. In the printer dialog, choose A4 paper and enable background graphics for the closest visual match.

## Saved drafts

**Save draft** saves the current invoice in the browser on that device. **New invoice** clears the customer and items and increments the number when it ends in digits.


## Footer and right-edge alignment fix

This version corrects the direct-PDF text measurement used for right-aligned content. The header, invoice metadata, totals and footer now use actual Helvetica glyph widths. The website contact group is anchored exactly to the A4 right margin.

## Line-item behavior
Only item rows containing a description, quantity, or unit price are included in the live invoice preview, browser printout, and direct PDF download. Blank editor rows are ignored automatically.



Update: This version adds the supplied Scifer icon as a soft watermark in the live preview, printed invoice, and direct PDF export.
