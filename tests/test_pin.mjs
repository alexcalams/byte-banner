import { computeFormTop, computePinCeiling } from "../assets/pin.js";
import assert from "node:assert/strict";

const pinCeiling = computePinCeiling({
  headerHeight: 72,
  headingOffsetInBody: 76,
});
assert.equal(pinCeiling, 148);

// Still in the hero: form stays in flow, above the body-area line.
assert.equal(
  computeFormTop({
    naturalTop: 374,
    pinCeiling,
    formHeight: 669,
    footerTop: 1800,
  }),
  374
);

// Scrolled: form would go under the header — hold it at the body heading line.
assert.equal(
  computeFormTop({
    naturalTop: 40,
    pinCeiling,
    formHeight: 669,
    footerTop: 1400,
  }),
  148
);

// Heading has arrived: form top matches the body-area pin.
assert.equal(
  computeFormTop({
    naturalTop: -200,
    pinCeiling,
    formHeight: 669,
    footerTop: 900,
  }),
  148
);

// Footer collision: release so the form does not cover the closing CTA.
assert.equal(
  computeFormTop({
    naturalTop: -400,
    pinCeiling,
    formHeight: 669,
    footerTop: 700,
  }),
  31
);

console.log("pin math ok");
