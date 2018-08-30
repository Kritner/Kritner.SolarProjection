using Kritner.SolarProjection.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Kritner.SolarProjection.Models
{
    /// <summary>
    /// Houses the solar projection and its comparison to utilities throughout
    /// the years specified
    /// </summary>
    public class SolarVsUtilityProjection
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="solarEstimate">The original solar estimate</param>
        /// <param name="futureProjection">The future years projection</param>
        /// <param name="financeYears">Number of years financed</param>
        public SolarVsUtilityProjection(
            IYearlyKwhUsage solarEstimate, 
            List<IYearlyKwhUsageCompare> futureProjection,
            int financeYears
        )
        {
            SolarEstimate = solarEstimate;
            FutureProjection = futureProjection;
            FinanceYears = financeYears;
        }

        /// <summary>
        /// The original solar estimate.
        /// </summary>
        public IYearlyKwhUsage SolarEstimate { get; }
        
        /// <summary>
        /// The future projections
        /// </summary>
        public List<IYearlyKwhUsageCompare> FutureProjection { get; }
        
        /// <summary>
        /// Finance years
        /// </summary>
        public int FinanceYears { get; }
    }
}
