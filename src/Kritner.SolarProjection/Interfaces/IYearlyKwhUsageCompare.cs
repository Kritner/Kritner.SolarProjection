namespace Kritner.SolarProjection.Interfaces
{
    /// <summary>
    /// Describes a comparison between a <see cref="SolarProjection"/>,
    /// and utility projection.
    /// </summary>
    public interface IYearlyKwhUsageCompare : IYearlyKwhUsage
    {
        /// <summary>
        /// The projection year.
        /// 
        /// TODO rename projection year.
        /// </summary>
        int PurchaseYear { get; }
        
        /// <summary>
        /// The solar projection for the year
        /// </summary>
        IYearlyKwhUsage SolarProjection { get; }
        
        /// <summary>
        /// The cost for the year if the solar covers 100% of energy usage
        /// </summary>
        double CostSolar100Percent { get; }
        
        /// <summary>
        /// The profit/losses of total utility energy cost - projection cost (100% of need generated)
        /// </summary>
        double TotalSavings100Percent { get; }
        
        /// <summary>
        /// The cost for the year if the solar covers 90% of energy usage
        /// </summary>
        double CostSolar90Percent { get; }
        
        /// <summary>
        /// The profit/losses of total utility energy cost - projection cost (90% of need generated)
        /// </summary>
        double TotalSavings90Percent { get; }
        
        /// <summary>
        /// The cost for the year if the solar covers 80% of energy usage
        /// </summary>
        double CostSolar80Percent { get; }
        
        /// <summary>
        /// The profit/losses of total utility energy cost - projection cost (80% of need generated)
        /// </summary>
        double TotalSavings80Percent { get; }
    }
}
