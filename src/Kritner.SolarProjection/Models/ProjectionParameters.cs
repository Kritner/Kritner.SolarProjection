using Kritner.SolarProjection.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Kritner.SolarProjection.Models
{
    /// <summary>
    /// Parameters describing how to perform a solar/utility projection
    /// </summary>
    public class ProjectionParameters
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="utilityYear">A utility year's <see cref="IYearlyKwhUsage"/>.</param>
        /// <param name="yearsToProject">The number of years to project into the future.</param>
        /// <param name="financeYears">The number of years the mortgage is active.</param>
        /// <param name="percentIncreasePerYear">The change in kw/h cost per year.</param>
        public ProjectionParameters(
            IYearlyKwhUsage utilityYear,
            int yearsToProject,
            int financeYears,
            double percentIncreasePerYear
        )
        {
            UtilityYear = utilityYear;
            YearsToProject = yearsToProject;
            FinanceYears = financeYears;
            PercentIncreasePerYear = percentIncreasePerYear;
        }

        /// <summary>
        /// A utility year's energy consumption
        /// </summary>
        public IYearlyKwhUsage UtilityYear { get; }
        
        /// <summary>
        /// The number of years to project into the future
        /// </summary>
        public int YearsToProject { get; }
        
        /// <summary>
        /// The number of years the mortgage is active.
        /// </summary>
        public int FinanceYears { get; }
        
        /// <summary>
        /// The change in kw/h cost per year.
        /// </summary>
        public double PercentIncreasePerYear { get; }
    }
}
