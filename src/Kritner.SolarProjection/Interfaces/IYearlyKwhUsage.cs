namespace Kritner.SolarProjection.Interfaces
{
    /// <summary>
    /// Describes kw/h usage for a year
    /// </summary>
    public interface IYearlyKwhUsage
    {
        /// <summary>
        /// The average cost per kilowatt hour.
        /// </summary>
        double AverageCostKiloWattHour { get; }
        
        /// <summary>
        /// The average cost per month.
        /// </summary>
        double AverageCostPerMonth { get; }
        
        /// <summary>
        /// The total cost for the year.
        /// </summary>
        double TotalCost { get; }
        
        /// <summary>
        /// The total kilowatt hours used in a year.
        /// </summary>
        int TotalKiloWattHours { get; }
    }
}