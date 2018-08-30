using System;
using System.Collections.Generic;
using System.Text;

namespace Kritner.SolarProjection.Models
{
    /// <inheritdoc/>
    public class MonthlyKwhUsage
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="billingPeriodStart">The start of the billing period</param>
        /// <param name="kiloWattHours">The kilowatt hours for the month</param>
        /// <param name="cost">The cost for the month</param>
        public MonthlyKwhUsage(DateTime billingPeriodStart, int kiloWattHours, double cost)
        {
            BillingPeriodStart = billingPeriodStart;
            KiloWattHours = kiloWattHours;
            Cost = cost;
        }

        /// <inheritdoc/>
        public DateTime BillingPeriodStart { get; }
        
        /// <inheritdoc/>
        public int KiloWattHours { get; }
        
        /// <inheritdoc/>
        public double Cost { get; }
        
        /// <inheritdoc/>
        public double CostPerKiloWattHour => Cost / KiloWattHours;
    }
}
