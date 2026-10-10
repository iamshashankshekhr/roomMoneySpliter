/**
 * Financial Calculation Engine — Integer Paise Split Math
 * 
 * Invariants:
 * 1. Money is strictly stored as integer paise (1 INR = 100 paise).
 * 2. Sum of member shares must equal total amount exactly: sum(shares) === total_paise.
 * 3. Remainder paise from integer division are distributed deterministically to the first n members.
 */

/**
 * Calculates equal splits for active participants, distributing remainder paise.
 * @param {number} totalPaise - Total expense in paise
 * @param {Array<string>} participantIds - List of member IDs sharing the expense
 * @returns {Record<string, number>} Map of memberId -> shareInPaise
 */
export function calculateEqualSplits(totalPaise, participantIds) {
  if (!participantIds || participantIds.length === 0 || totalPaise <= 0) {
    return {};
  }

  const count = participantIds.length;
  const baseShare = Math.floor(totalPaise / count);
  const remainder = totalPaise % count;

  const splits = {};
  participantIds.forEach((memberId, idx) => {
    // Distribute 1 remainder paise to the first `remainder` members
    const extra = idx < remainder ? 1 : 0;
    splits[memberId] = baseShare + extra;
  });

  return splits;
}

/**
 * Validates that an array of split items matches the total paise exactly
 * @param {number} totalPaise
 * @param {Array<{ member_id: string, amount_paise: number }>} splits
 * @returns {{ valid: boolean, discrepancy: number }}
 */
export function validateSplitIntegrity(totalPaise, splits) {
  if (!Array.isArray(splits) || splits.length === 0) {
    return { valid: false, discrepancy: totalPaise };
  }

  const splitSum = splits.reduce((acc, curr) => acc + (curr.amount_paise || 0), 0);
  const discrepancy = totalPaise - splitSum;

  return {
    valid: discrepancy === 0,
    discrepancy,
    splitSum,
  };
}
