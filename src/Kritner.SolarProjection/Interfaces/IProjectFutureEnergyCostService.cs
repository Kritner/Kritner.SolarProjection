using Kritner.SolarProjection.Models;

namespace Kritner.SolarProjection.Interfaces
{
    /// <summary>
    /// Describes operations for solar/utility projection over time.
    /// </summary>
    public interface IProjectFutureEnergyCostService
    {
        /// <summary>
        /// Calculates a future projection for solar vs utility.
        /// Projection is broken out between varying solar coverage (100%, 90% etc).
        /// 
        /// Projection assumes a 3% utility increase per year, 
        /// where the solar mortgage stays static (as mortgages generally do).
        /// </summary>
        /// <param name="solarEstimate">The solar usage for a year.</param>
        /// <param name="projectionParameters">The parameters involved in making the projection.</param>
        /// <returns></returns>
        SolarVsUtilityProjection CalculateFutureProjection(IYearlyKwhUsage solarEstimate, ProjectionParameters projectionParameters);
    }
}