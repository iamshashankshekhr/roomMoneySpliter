/**
 * Debt Minimization & Balance Ledger Engine (FR-BAL-01 to FR-BAL-07)
 */

export function calculateNetBalances(members = [], expenses = [], splits = [], confirmedPayments = []) {
  const ledger = {};

  // Initialize every member
  members.forEach(member => {
    ledger[member.id] = {
      member,
      paidPaise: 0,
      sharePaise: 0,
      netPaise: 0,
    };
  });

  // Sum payments made
  expenses.forEach(exp => {
    if (ledger[exp.paid_by_member_id]) {
      ledger[exp.paid_by_member_id].paidPaise += Number(exp.amount_paise) || 0;
    }
  });

  // Sum shares assigned
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
        ledger[payment.from_member_id].paidPaise += amt;
      }
      if (ledger[payment.to_member_id]) {
        ledger[payment.to_member_id].sharePaise += amt;
      }
    }
  });

  // Calculate net balances: paid - share
  let discrepancy = 0;
  Object.values(ledger).forEach(entry => {
    entry.netPaise = entry.paidPaise - entry.sharePaise;
    discrepancy += entry.netPaise;
  });

  return {
    ledger,
    discrepancy,
  };
}

/**
 * Greedy Debt Reduction Algorithm
 * Minimizes N group debts into a smaller deterministic transfer list
 */
export function generateSimplifiedTransfers(ledger) {
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

  // Sort descending: largest debts & credits first
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
        id: `tr_${debtor.member.id}_${creditor.member.id}`,
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
