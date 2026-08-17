/**
 * Viewport top for the lead form.
 *
 * The form follows normal flow until it would rise above the body-area
 * pin line (the rest position of "In this white paper, you'll learn how to:").
 * It stays there through the body, then releases when the footer collides.
 */
export function computeFormTop({
  naturalTop,
  pinCeiling,
  formHeight,
  footerTop,
}) {
  let top = naturalTop;
  if (top < pinCeiling) top = pinCeiling;
  if (footerTop < top + formHeight) top = footerTop - formHeight;
  return top;
}

/**
 * Body-area pin line: header height plus the heading's offset inside
 * the details section. When the body docks under the header, the
 * heading (and the form top) sit on this line — not flush to the nav.
 */
export function computePinCeiling({ headerHeight, headingOffsetInBody }) {
  return headerHeight + headingOffsetInBody;
}
