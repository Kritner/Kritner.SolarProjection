using Kritner.SolarProjection.Interfaces;
using System;
using System.Text;

namespace Kritner.SolarProjection.Models
{
    /// <summary>
    /// Represents <see cref="IYearlyKwhUsage"/> from the year's totals.
    /// </summary>
    /// <inheritdoc/>
    public class YearlyKwhUsageFromAnnual : IYearlyKwhUsage
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="totalCost">The total cost for the year.</param>
        /// <param name="totalKiloWattHours">The total kw/h for the year.</param>
        public YearlyKwhUsageFromAnnual(double totalCost, int totalKiloWattHours)
        {
            TotalCost = totalCost;
            TotalKiloWattHours = totalKiloWattHours;
        }

        /// <inheritdoc/>
        public double AverageCostKiloWattHour => TotalCost / TotalKiloWattHours;

        /// <inheritdoc/>
        public double AverageCostPerMonth => TotalCost / 12;

        /// <inheritdoc/>
        public double TotalCost { get; private set; }

        /// <inheritdoc/>
        public int TotalKiloWattHours { get; private set; }
    }
}
