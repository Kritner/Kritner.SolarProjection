using Kritner.SolarProjection.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Kritner.SolarProjection.Helpers
{
    /// <summary>
    /// Helper class containing data from my (The Kritner's) 2017 
    /// electricty usage.
    /// </summary>
    public static class ElectricityDataHelper
    {
        /// <summary>
        /// 2017 Yearly usage from each individual month.
        /// </summary>
        /// <returns></returns>
        public static YearlyKwhUsageFromMonthly GetUsageUtility2017()
        {
            List<MonthlyKwhUsage> monthlyCollection2017 = new List<MonthlyKwhUsage>()
            {
                new MonthlyKwhUsage(new DateTime(2017, 1, 1), 1279, 184.03),
                new MonthlyKwhUsage(new DateTime(2017, 2, 1), 1035, 152.21),
                new MonthlyKwhUsage(new DateTime(2017, 3, 1), 1063, 153.65),
                new MonthlyKwhUsage(new DateTime(2017, 4, 1), 1075, 157.43),
                new MonthlyKwhUsage(new DateTime(2017, 5, 1), 1123, 164.07),
                new MonthlyKwhUsage(new DateTime(2017, 6, 1), 1986, 271.40),
                new MonthlyKwhUsage(new DateTime(2017, 7, 1), 2191, 296.36),
                new MonthlyKwhUsage(new DateTime(2017, 8, 1), 1926, 261.51),
                new MonthlyKwhUsage(new DateTime(2017, 9, 1), 1673, 223.58),
                new MonthlyKwhUsage(new DateTime(2017, 10, 1), 1196, 161.04),
                new MonthlyKwhUsage(new DateTime(2017, 11, 1), 1201, 161.50),
                new MonthlyKwhUsage(new DateTime(2017, 12, 1), 1271, 170.44)
            };

            return new YearlyKwhUsageFromMonthly(monthlyCollection2017);
        }
        
        /// <summary>
        /// 2017 Yearly usage.
        /// </summary>
        /// <returns></returns>
        public static YearlyKwhUsageFromAnnual GetUsageUtility2017FromAnnual()
        {
            var monthly = GetUsageUtility2017();
            return new YearlyKwhUsageFromAnnual(monthly.TotalCost, monthly.TotalKiloWattHours);
        }

        /// <summary>
        /// Solar panel mortgage each month paired with 2017 kw/h usage.
        /// </summary>
        /// <returns></returns>
        public static YearlyKwhUsageFromMonthly GetUsageWithPanelsMortgage()
        {
            List<MonthlyKwhUsage> panelExampleFrom2017Usage = new List<MonthlyKwhUsage>()
            {
                new MonthlyKwhUsage(new DateTime(2017, 1, 1), 1279, 189),
                new MonthlyKwhUsage(new DateTime(2017, 2, 1), 1035, 189),
                new MonthlyKwhUsage(new DateTime(2017, 3, 1), 1063, 189),
                new MonthlyKwhUsage(new DateTime(2017, 4, 1), 1075, 189),
                new MonthlyKwhUsage(new DateTime(2017, 5, 1), 1123, 189),
                new MonthlyKwhUsage(new DateTime(2017, 6, 1), 1986, 189),
                new MonthlyKwhUsage(new DateTime(2017, 7, 1), 2191, 189),
                new MonthlyKwhUsage(new DateTime(2017, 8, 1), 1926, 189),
                new MonthlyKwhUsage(new DateTime(2017, 9, 1), 1673, 189),
                new MonthlyKwhUsage(new DateTime(2017, 10, 1), 1196, 189),
                new MonthlyKwhUsage(new DateTime(2017, 11, 1), 1201, 189),
                new MonthlyKwhUsage(new DateTime(2017, 12, 1), 1271, 189)
            };

            return new YearlyKwhUsageFromMonthly(panelExampleFrom2017Usage);
        }

        /// <summary>
        /// Solar panel mortgage paired with 2017 year's kw/h usage.
        /// </summary>
        /// <returns></returns>
        public static YearlyKwhUsageFromAnnual GetUsageWithPanelsMortgageAnnual()
        {
            var monthly = GetUsageWithPanelsMortgage();
            return new YearlyKwhUsageFromAnnual(monthly.TotalCost, monthly.TotalKiloWattHours);
        }
    }
}
