---
layout: post
title: "Crime and Socioeconomic Factors in London"
date: 2025-01-22
description: Project for my "Managing and Visualising Data" module at LSE.
github: https://github.com/belowwind-islander
used: [Python, APIs, BeautifulSoup, Data Visualisation, Linear Regression]
---

## Introduction

In this blog post, I’ll walk through the key insights, methodologies, and challenges encountered in this analysis for my "Managing and Visualising Data" module at LSE.

Crime is a complex phenomenon shaped by a web of social, economic, and environmental factors. For this project, my group and I set out to investigate how socioeconomic indicators correlate with crime rates in London. Leveraging open datasets from the UK government, this project aimed to answer critical questions: *Which London boroughs face the highest crime rates? How do factors like education, housing, and public spending influence crime? Can we predict future crime trends?*

---

## The Data 

The analysis combined **12 datasets** spanning crime records, socioeconomic metrics, and geographic boundaries. Key datasets were produced by combining web-scraping with call requests to APIs. Sources included:  


1. **Crime Data**: Street-level crime records (Dec 2021–Apr 2024) from the UK Police API. (https://data.police.uk/).

2. **Socioeconomic Data**: Census metrics (unemployment, demographics), housing prices, education levels, and public spending from the Office for National Statistics (ONS). Sports facility locations from the Active Places Open Data API (https://www.activeplacespower.com/) and activity levels from Active Lives Sport England (https://activelives.sportengland.org/). 

3. **Supplemental Data**: Borough names scraped from wikipedia (https://en.wikipedia.org/wiki/List_of_London_boroughs), ONS Local Authority codes scraped from the government site (https://get-information-schools.service.gov.uk/Guidance/LaNameCodes) and geographical borough boundaries taken from the UK Data Service (https://borders.ukdataservice.ac.uk/).

**Challenges**:  

1. **Temporal alignment**: Socioeconomic data (e.g., 2021 Census) needed to be linked to crime trends with lagged effects.

2. **Anomalies**: The City of London was excluded due to its unique status as a business hub with minimal residents.  

---

## Key Findings  

#### 1. Spatial Patterns in Crime

- **Westminster**, **Kensington & Chelsea**, and **Hammersmith & Fulham** emerged as the boroughs with the highest crime rates.  

- Central London boroughs consistently showed elevated crime levels compared to outer areas, likely driven by higher population density, tourism, and economic activity.  

<figure class="post-image2">
  <img src="/img/posts/ST445/crimemap.png" alt="Description" loading="lazy">
  <figcaption>Fig. 1: London Crime Heatmap.</figcaption>
</figure>

#### 2. Hidden Patterns with Dimensionality Reduction
Taking out crime rates and performing Principal Component Analysis (PCA) revealed clusters of boroughs with shared socioeconomic traits. For example:  

PCA effectively separated central and outer boroughs based on the first and second principal components.

K-means clustering identified two major groups that broadly align with central vs. outer London.

<figure class="post-image2">
  <img src="/img/posts/ST445/clusters.png" alt="Description" loading="lazy">
  <figcaption>Fig. 2: Comparison of PCA Plots: spatial-based selection vs. K-means clustering.</figcaption>
</figure>

#### 3. Potential Socioeconomic Drivers of Crime
To better analyse the hypotheses, analysis was performed on a subset of the explanatory variables. These variables were selections of one or two variables from each of the originally sourced datasets which have either empirically been found to have some impact of crime rates or are variables which would give interesting insight. This limits explanatory variables and a produces potentially more informative visual analyses. Findings from correlation plots included:

- **Public Spending**: Increased expenditure on public safety showed a slight negative correlation with crime, suggesting targeted spending could mitigate risks.
- **Demographics and Civil Status**: There is some link between crime and proportion of young adults.
- **House Prices**: Higher median house prices have a strong positive correlation to higher crime. This is, however, more likely due to the fact that central boroughs, which normally have more expensive housing than outer ones, are shown to have higher crime rates.
- **Sports and Facilities**: Interestingly, the number of table tennis tables in a borough has a negative correlation with crime rates.

<figure class="post-image2">
  <img src="/img/posts/ST445/corrplots.png" alt="Description" loading="lazy">
  <figcaption>Fig. 3: Correlation Plots of Crime with different socioeconomic factors.</figcaption>
</figure>


#### 4. Modelling

A "Kitchen-Sink" linear regression was built on all variables available and compared to a regressions with less covariates and a regression with L2-regularisation (Lasso).

1. **Kitchen-Sink Model** (all variables): Poor performance (test R²=0.24) due to noise and multicollinearity.  

2. **Short Model** (selected variables): Improved performance (test R²=0.62), however most covariates had t-statistics with high corresponding p-value, therefore there is no statistically significant evidence to suggest the coefficients of these covariates are not equal to 0. Removing these covariates from the model leads to the "Truncated Short" model.  

3. **Truncated Short Model** (selected variables with high p-value coefficients removed): Best performance (test R²=0.74). By taking out the covariates deemed unnecessary by the t-test, the model becomes less likely to overfit to the data and preserve generality making it perform better on test data. 

4. **LASSO Regression**: Reduced noise by reducing dimensionality of the data (R²=0.35) and identified unexpected predictors like sports facilities (e.g. sports halls, swimming pools, table tennis venues), which could be further analysed. Interestingly, public safety spending was the only covariate that was both in the "Short" model and the Lasso.  

The "Truncated Short" model can be expressed as:

```plaintext
Crime Rate = 0.017 + 0.66*(No Qualifications %) + 0.39*(Mean House Prices)

Coefficient Interpretation:
- Each 1% increase in population with no qualifications is associated 
with a 0.66 unit increase in crime rate
- Each £1,000 increase in mean house prices is associated with a 
0.39 unit increase in crime rate
```

Although the model identifies relationships between crime, the absence of qualifications, and mean house prices, it does not imply causation. The observed positive relationship between crime and house prices likely arises because central boroughs tend to have both higher crime rates and more expensive housing, not because high house prices cause more crime, as previously mentioned.

<figure class="post-image2">
  <img src="/img/posts/ST445/corrmap.png" alt="Description" loading="lazy">
  <figcaption>Fig. 4: Correlations between potential determinants of crime in London. High number of correlated covariates explains the weak performance behind the "Kitchen-Sink" model.</figcaption>
</figure>

| Variable | Coefficient | Std. Error | t-value | p-value | 95% Conf. Interval |
|----------|-------------|------------|---------|---------|--------------------|
| Public safety spending       | -0.2844     | 0.148      | -1.926  | 0.070   | [-0.595, 0.026]    |
| Employment rate       | -0.3917     | 0.284      | -1.381  | 0.184   | [-0.987, 0.204]    |
| Percentage of population, male, aged 20-30       | -0.8053     | 0.569      | -1.415  | 0.174   | [-2.001, 0.390]    |
| Physical activity       | -0.3007     | 0.248      | -1.213  | 0.241   | [-0.822, 0.220]    |
| Percentage NEETNK       | -0.1510     | 0.132      | -1.141  | 0.269   | [-0.429, 0.127]    |
| Percentage with no qualifications       | 0.0666       | 0.166      | 0.402   | 0.692   | [-0.282, 0.415]    |
| Mean house price       | 0.6234       | 0.213      | 2.925   | 0.009   | [0.176, 1.071]     |
| Percentage never married, aged 25-34       | 1.7068       | 0.735      | 2.324   | 0.032   | [0.164, 3.250]     |
| Number of table tennis tables       | 0.0936       | 0.174      | 0.538   | 0.597   | [-0.272, 0.459]    |

<figure class="post-image">
  <figcaption>Fig. 5: "Short" model summary. Covariates with high corresponding p-values were sequentially removed until there remained no more covariates with high p-values. This led to the "Truncated Short" model.</figcaption>
</figure>

---

## **Limitations & Future Work**  
- **Small Sample Size**: Only 33 boroughs limited statistical power. Expanding to multi-year panel data would strengthen the insights.  
- **Crime Type Granularity**: Aggregating all crimes masked nuances (e.g., theft vs. violent crime). Since these crime types are likely to have unique drivers, the analysis could benefit from a more granular approach.   
- **Causality vs. Correlation**: While models identified associations, causal inference requires longitudinal data.  

---

## **Conclusion**  
This project highlights the link between socioeconomic factors and crime in London. Central boroughs see higher crime rates, likely due to population density and economic activity, while factors like education, housing prices, and public spending also play key roles. Our refined “Truncated Short Model” improved predictive accuracy, but correlation does not imply causation. Future work could explore causal mechanisms, crime-specific trends, and multi-year data to strengthen insights. Data-driven approaches like this can help inform policy and urban planning to enhance public safety.
