// HAPP — Compliance Service
// Calculates supplement adherence: daily and weekly averages
// Logic: completed / total active supplements for a given day

const ComplianceService = {
  /**
   * Calculate today's compliance
   * @param {string[]} completedIds - supplement IDs checked today
   * @param {string[]} activeIds - all active supplement IDs for today
   * @returns {number} 0–1 (e.g. 0.75 = 75%)
   */
  calcToday(completedIds, activeIds) {
    if (!activeIds.length) return 0;
    return completedIds.length / activeIds.length;
  },

  /**
   * Calculate weekly average compliance
   * @param {Object[]} weeklyRecords - array of {date, completed, total}
   * @returns {number} 0–1
   */
  calcWeeklyAverage(weeklyRecords) {
    if (!weeklyRecords.length) return 0;
    const sum = weeklyRecords.reduce((acc, r) => acc + (r.total ? r.completed / r.total : 0), 0);
    return sum / weeklyRecords.length;
  },

  /**
   * Get today's date key YYYY-MM-DD
   */
  todayKey() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Get last 7 days keys
   */
  last7Days() {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();
  }
};
