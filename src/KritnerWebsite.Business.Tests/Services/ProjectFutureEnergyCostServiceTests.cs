﻿using KritnerWebsite.Business.Helpers;
using KritnerWebsite.Business.Models;
using KritnerWebsite.Business.Services;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Text;

namespace KritnerWebsite.Business.Tests.Services
{
    [TestFixture]
    public class ProjectFutureEnergyCostServiceTests
    {
        private readonly ProjectFutureEnergyCostService _subject = new ProjectFutureEnergyCostService();
        private const int ORIGINAL_KWH = 1000;
        private const double PERCENT_INCREASE_PER_YEAR = .1;
        private const double ORIGINAL_COST = 100;
        
        [Test]
        [TestCase(1)]
        [TestCase(5)]
        [TestCase(10)]
        public void ShouldProjectCorrectNumberOfYears(int yearsToProject)
        {
            var result = _subject.CalculateFutureProjection(
                GetSampleData(), 
                new ProjectionParameters(GetSampleData(), yearsToProject, PERCENT_INCREASE_PER_YEAR)
            );

            Assert.AreEqual(yearsToProject, result.BgeFutureProjection.Count, nameof(yearsToProject));
        }

        [Test]
        [TestCase(5)]
        public void ShouldIncreaseProjectionByCorrectAmount(int yearsToProject)
        {
            var result = _subject.CalculateFutureProjection(
                GetSampleData(),
                new ProjectionParameters(GetSampleData(), yearsToProject, PERCENT_INCREASE_PER_YEAR)
            );

            var sample = GetSampleData();
            for (int i = 1; i < yearsToProject; i++)
            {
                Assert.AreEqual(
                    FormulaHelpers.CompoundInterest(ORIGINAL_COST, PERCENT_INCREASE_PER_YEAR, 1, i), 
                    result.BgeFutureProjection[i].TotalCost, 
                    .01,
                    $"{i} index Cost");
            }
        }

        private static YearlyKwhUsageFromMonthly GetSampleData()
        {
            return new YearlyKwhUsageFromMonthly(new List<MonthlyKwhUsage>()
            {
                new MonthlyKwhUsage(new DateTime(), ORIGINAL_KWH, ORIGINAL_COST)
            });
        }
    }
}
