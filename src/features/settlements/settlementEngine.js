/**
 * Module D — Balance & Settlement Engine (FR-BAL-01 to FR-BAL-07)
 * 
 * Computes net balances per member and generates simplified settlement transfers
 * using a deterministic greedy debt-reduction algorithm.
 */

/**
 * Calculates net balance for every member in the room.
 * Net balance = (total amount paid by member) - (total assigned shares of member).
 * 
 * @param {Array<Object>} members - Room members [{ id, display_name }]
 * @param {Array<Object>} expenses - List of room expenses
 * @param {Array<Object>} splits - All expense splits [{ expense_id, member_id, amount_paise }]
 * @param {Array<Object>} confirmedPayments - Already confirmed settlement payments to offset [{ from_member_id, to_member_id, amount_paise, status }]
 * @returns {Record<string, { member: Object, paidPaise: number, sharePaise: number, netPaise: number }>}
 */
export function calculateNetBalances(members = [], expenses = [], splits = [], confirmedPayments = []) {
  const ledger = {};

  // Initialize all active members
  members.forEach(member => {
    ledger[member.id] = {
      member,
      paidPaise: 0,
      sharePaise: 0,
      netPaise: 0,
    };
  });

  // Accumulate amounts paid
  expenses.forEach(expense => {
    if (ledger[expense.paid_by_member_id]) {
      ledger[expense.paid_by_member_id].paidPaise += Number(expense.amount_paise) || 0;
    }
  });

  // Accumulate shares assigned
  splits.forEach(split => {
    if (ledger[split.member_id]) {
      ledger[split.member_id].sharePaise += Number(split.amount_paise) || 0;
    }
  });

  // Offset with any already completed settlement repayments
  confirmedPayments.forEach(payment => {
    if (payment.status === 'recipient_confirmed') {
      const amt = Number(payment.amount_paise) || 0;
      if (ledger[payment.from_member_id]) {
        // Payer gave money, so their net balance increases (reduces debt)
        ledger[payment.from_member_id].paidPaise += amt;
      }
      if (ledger[payment.to_member_id]) {
        // Recipient received money, so their net balance decreases (reduces credit)
        ledger[payment.to_member_id].sharePaise += amt;
      }
    }
  });

  // Compute final net paise
  let totalNetCheck = 0;
  Object.values(ledger).forEach(entry => {
    entry.netPaise = entry.paidPaise - entry.sharePaise;
    totalNetCheck += entry.netPaise;
  });

  // Invariant verification (FR-BAL-05)
  if (totalNetCheck !== 0) {
    console.warn(`[settlementEngine] Non-zero balance discrepancy detected: ${totalNetCheck} paise`);
  }

  return ledger;
}

/**
 * Deterministic Greedy Debt Minimization Algorithm (FR-BAL-03, FR-BAL-04, FR-BAL-07)
 * Produces the simplified "Who Pays Whom" instructions.
 * 
 * @param {Record<string, { member: Object, netPaise: number }>} ledger
 * @returns {Array<{ fromMember: Object, toMember: Object, amountPaise: number }>}
 */
export function generateSettlementPlan(ledger) {
  const debtors = [];
  const creditors = [];

  Object.values(ledger).forEach(entry => {
    if (entry.netPaise < 0) {
      debtors.push({
        member: entry.member,
        balance: Math.abs(entry.netPaise),
      });
    } else if (entry.netPaise > 0) {
      creditors.push({
        member: entry.member,
        balance: entry.netPaise,
      });
    }
  });

  // Deterministic sort: largest debt/credit first; fallback to member ID string comparison
  debtors.sort((a, b) => b.balance - a.balance || a.member.id.localeCompare(b.member.id));
  creditors.sort((a, b) => b.balance - a.balance || a.member.id.localeCompare(b.member.id));

  const transfers = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amount = Math.min(debtor.balance, creditor.balance);

    if (amount > 0) {
      transfers.push({
        fromMember: debtor.member,
        toMember: creditor.member,
        amountPaise: amount,
      });
    }

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) dIdx++;
    if (creditor.balance === 0) cIdx++;
  }

  return transfers;
}
