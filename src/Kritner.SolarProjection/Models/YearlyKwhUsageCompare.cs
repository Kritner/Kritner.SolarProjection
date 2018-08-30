using Kritner.SolarProjection.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Kritner.SolarProjection.Models
{
    /// <summary>
    /// Compares solar and utility usage costs.
    /// </summary>
    /// <inheritdoc/>
    public class YearlyKwhUsageCompare : YearlyKwhUsageFromAnnual, IYearlyKwhUsageCompare
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="totalCost">The total cost for the year.</param>
        /// <param name="totalKiloWattHours">Total kw/h used in the year.</param>
        /// <param name="purchaseYear">The year being projected.</param>
        /// <param name="solarProjection">The solar projection for the year.</param>
        /// <inheritdoc/>
        public YearlyKwhUsageCompare(
            double totalCost, 
            int totalKiloWattHours, 
            int purchaseYear, 
            IYearlyKwhUsage solarProjection
        ) 
            : base(totalCost, totalKiloWattHours)
        {
            PurchaseYear = purchaseYear;
            SolarProjection = solarProjection;

            CostSolar100Percent = CalculateTotalCost(1);
            CostSolar90Percent = CalculateTotalCost(0.9);
            CostSolar80Percent = CalculateTotalCost(0.8);

            TotalSavings100Percent = totalCost - CostSolar100Percent;
            TotalSavings90Percent = totalCost - CostSolar90Percent;
            TotalSavings80Percent = totalCost - CostSolar80Percent;
        }

        /// <inheritdoc/>
        public int PurchaseYear { get; }

        /// <inheritdoc/>
        public IYearlyKwhUsage SolarProjection { get; }

        /// <inheritdoc/>
        public double CostSolar100Percent { get; }
        
        /// <inheritdoc/>
        public double TotalSavings100Percent { get; }

        /// <inheritdoc/>
        public double CostSolar90Percent { get; }

        /// <inheritdoc/>
        public double TotalSavings90Percent { get; }

        /// <inheritdoc/>
        public double CostSolar80Percent { get; }

        /// <inheritdoc/>
        public double TotalSavings80Percent { get; }

        /// <inheritdoc/>
        public double CalculateTotalCost(double solarGenerationPercentage)
        {
            return TotalCost * (1 - solarGenerationPercentage) + SolarProjection.TotalCost;
        }
}
}
