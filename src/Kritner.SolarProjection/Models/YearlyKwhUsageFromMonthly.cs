using Kritner.SolarProjection.Interfaces;
using System.Collections.Generic;
using System.Linq;

namespace Kritner.SolarProjection.Models
{
    /// <summary>
    /// Represents <see cref="IYearlyKwhUsage"/> using individual months.
    /// </summary>
    /// <inheritdoc/>
    public class YearlyKwhUsageFromMonthly : IYearlyKwhUsage
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="monthlyUsage">The monthly usage for the year.</param>
        public YearlyKwhUsageFromMonthly(List<MonthlyKwhUsage> monthlyUsage)
        {
            MonthlyUsage = monthlyUsage;
        }

        /// <summary>
        /// The monthly usage making up the year.
        /// </summary>
        public List<MonthlyKwhUsage> MonthlyUsage { get; }

        /// <inheritdoc/>
        public double AverageCostKiloWattHour => MonthlyUsage.Average(a => a.CostPerKiloWattHour);

        /// <inheritdoc/>
        public double AverageCostPerMonth => TotalCost / MonthlyUsage.Count;

        /// <inheritdoc/>
        public double TotalCost => MonthlyUsage.Sum(s => s.Cost);

        /// <inheritdoc/>
        public int TotalKiloWattHours => MonthlyUsage.Sum(s => s.KiloWattHours);
    }
}
