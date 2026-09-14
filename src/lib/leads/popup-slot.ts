/**
 * One auto-opening thing at a time.
 *
 * The site has two features that can open themselves: the scripted chat and
 * the welcome offer. Both are useful, both convert, and both are intolerable
 * if they arrive together. This is the lock they compete for — first caller in
 * a page view wins, everybody else stays shut until the next navigation.
 *
 * Deliberately module state, not storage: the point is to stop two things
 * opening in the same breath, not to remember anything across visits. Each
 * feature keeps its own suppression window for that.
 */

let claimedBy: string | null = null;

/**
 * Try to take the slot. Returns true if the caller may open itself.
 * Calling again with the same owner is idempotent, so a component that
 * re-renders or re-opens does not lose a slot it already holds.
 */
export function claimPopupSlot(owner: string): boolean {
  if (claimedBy === null || claimedBy === owner) {
    claimedBy = owner;
    return true;
  }
  return false;
}

/** Give the slot back, so a later trigger on the same page can use it. */
export function releasePopupSlot(owner: string): void {
  if (claimedBy === owner) claimedBy = null;
}

/** True when something already owns the slot (and it is not the caller). */
export function popupSlotTaken(owner: string): boolean {
  return claimedBy !== null && claimedBy !== owner;
}
