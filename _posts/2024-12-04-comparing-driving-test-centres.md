---
layout: post
title: 'Statistical Analysis of Pass Rates at Crawley and Wood Green Driving Test Centres'
date: 2024-12-04
description: Project for my "Data Analysis and Statistical Methods" module at LSE.
github: https://github.com/belowwind-islander
used: [R, Logistic Regression, Hypothesis Testing]
---

# Introduction

In this post, I’ll walk through the **approach and key findings** from analysing the pass rates between two different driving test centres in London. This was an individual project completed for the "Data Analysis and Statistical Methods" module at LSE (ST447).

# Introducing My Friend, XYZ

```         
The profile of XYZ:
- Age:  17
- Gender:  Male
- Home address:  Crawley
```

XYZ has been learning driving for some time, and is thinking of taking the practical car test in UK. There are two sensible options for XYZ:

1.  either take the practical test at the nearest test centre to his/her home (Crawley);
2.  or take it at the nearest test centre to the LSE (Wood Green).

XYZ thinks their driving skill is about average. It is widely believed that the driving test routes around some centres are probably more difficult than others (e.g. there are far less bus lanes, roundabouts and cyclists in rural areas than in London).

This report looks to use logistic regression and hypothesis testing to analyse the historic pass rates at Crawley and Wood Green test centre to answer the following questions:

1.  **What is XYZ's expected passing rate at Crawley test centre?**
2.  **What is XYZ's expected passing rate at Wood Green test centre?**
3.  **Of these two locations, where should XYZ take the test? Is there any evidence to (statistically) support this suggestion?**

# The Dataset

The dataset is a transformed version of the **DVSA1203 dataset from the UK government website**. It contains information on driving tests conducted at Crawley and Wood Green test centres from 2010 to 2024, detailing the number of tests taken and passed broken down by age (17–25) and gender.

Due to the large number of tests that have historically been taken at Crawley and Wood Green, the analysis **focuses on the data points generated from tests taken only by individuals who are 17 years old and male**. This minimises variability due to age or gender and focuses the analysis specifically with XYZ's profile.

It must be noted that the periods recorded in the DVSA1203 dataset span 12 months starting from September. For ease, each period is labeled in the dataset based on the calendar year for which the majority of the period falls (e.g. Sept 2009 - Sept 2010 is labelled as 2010).

# Methodology

## Set-up

Let $$Y_i$$ represent the outcome of the $$i$$th driving test for $$i = {1,2,...,n}$$.

$$Y_i \in \{0,1\}$$ where 0 represents not a pass and 1 represents a pass.

Each $$Y_i$$ is independently and identically distributed as $$Bernoulli(p)$$, where $$p$$ is the probability of passing (ie. the pass rate).

Before modelling and comparing the test centres, a window which the analysis is based upon must be determined.

It is assumed that no changes occur in the window chosen for the analysis that would affect the pass rate.

It is also assumed that the pass rate remains constant in the window analysed.

## Determining a Window of Analysis

<figure class="post-image">
  <img src="/img/posts/ST447/plot.png" alt="Description" loading="lazy">
  <figcaption>Fig. 1: Chart depicting the annual number of driving tests conducted and pass rates at each centre.</figcaption>
</figure>

In 2021, there is a noticeable decline in the number of tests conducted with a sharp increase in the pass rate. This is likely attributable to the effects of the COVID-19 pandemic. To avoid the impact of this on the analysis, 2021 will be removed.

Additionally the relevance of older years is questionable. From 2010 to 2024 there have been various changes to how the tests are conducted and road infrastru (eg. cycle lanes added). Though these changes might have no impact, the analysis will focus on a window composed of more recent years to ensure relevance and consistency.

The dataset will be restricted to the last three years (2022, 2023, and 2024). Although this reduces the number of years analysed, the historically high volume of tests conducted at both test centres still provides a sufficiently large sample, $$n=2446$$, for robust statistical analysis.

## Modelling Expected Pass Rates

Since the outcome of a test is modelled as $$Bernoulli(p)$$, the sample mean serves as a unbiased and consistent estimator for $$p$$.

XYZ's is an average driver, therefore their expected pass rate for each test centre can be modeled as:

$$
\frac{Total\ Passes_{Centre}}{Total\ Conducted_{Centre}}
$$

Based on the sample mean from the last three years, XYZ's expected passing rate is estimated to be **48.2%** at Crawley and **54.2%** at Wood Green.

## Comparing Crawley vs Wood Green

To identify whether one test centre is more favourable than the other, a **Logistic Regression** model with a single predictor (the test centre), $$X$$, will be built.

### Introduction to Logistic Regression
Logistic regression is a **statistical method used for binary classification problems**, where the response variable can take one of two values (e.g., pass or fail). Unlike linear regression, logistic regression **models the probability that a given observation belongs to a particular category**. 

The logistic regression model assumes the relationship between the predictor variable, $$X$$, and the probability of success, 
$$
P(Y=1 | X)
$$, is given by the **logistic function**:


$$P(Y=1|X) = \frac{e^{\beta_0 + \beta_1 X}}{1 + e^{\beta_0 + \beta_1 X}}$$


where $$\beta_0$$ is the intercept and  $$\beta_1$$ is the coefficient for the predictor variable, $$X$$, which in this case represents the test centre (Wood Green or Crawley).

The **logit function**, which is the natural logarithm of the odds, is defined as:

$$
\text{logit}(P(Y=1|X)) = \log \left( \frac{P(Y=1|X)}{1 - P(Y=1|X)} \right) = \beta_0 + \beta_1 X
$$

This transformation ensures that the probability estimates remain within the range $$(0,1)$$, making logistic regression suitable for classification tasks.

### Log-Likelihood Function Derivation

The logistic regression model is estimated using Maximum Likelihood Estimation (MLE). Given a dataset with $$n$$ observations, let $$Y_i$$ be the binary outcome for the $$i$$-th observation (1 if pass, 0 if fail), $$X_i$$ be the corresponding test centre indicator (0 for Wood Green, 1 for Crawley) and 
$$p_i = P(Y_i=1|X_i)$$
be the predicted probability of passing for the $$i$$-th observation.

Since each $$Y_i$$ follows a Bernoulli distribution:


$$P(Y_i|X_i) = p_i^{Y_i} (1 - p_i)^{1 - Y_i}$$

The likelihood function for the entire dataset is given by:


$$L(\beta_0, \beta_1) = \prod_{i=1}^{n} p_i^{Y_i} (1 - p_i)^{1 - Y_i}$$


Taking the natural logarithm, the log-likelihood function is:


$$\ell(\beta_0, \beta_1) = \sum_{i=1}^{n} \left[ Y_i \log p_i + (1 - Y_i) \log(1 - p_i) \right]$$


Substituting $$p_i$$ from the logistic function:


$$\ell(\beta_0, \beta_1) = \sum_{i=1}^{n} \left[ Y_i(\beta_0 + \beta_1 X_i) - \log(1 + e^{\beta_0 + \beta_1 X_i}) \right]$$


This log-likelihood function is maximized to estimate the parameters $$\beta_0$$ and $$\beta_1$$, which determine the relationship between the test centre and the probability of passing.

### Interpretation of $$\beta_1$$
After estimating $$\beta_1$$, the sign of $$\hat{\beta}_1$$ provides insights:
- If $$\hat{\beta}_1 > 0$$, taking the test at Crawley increases the probability of passing.
- If $$\hat{\beta}_1 < 0$$, taking the test at Wood Green increases the probability of passing.
- If $$\hat{\beta}_1 = 0$$, the test centre has no effect on the pass rate.

### Hypothesis Testing for $$\beta_1$$
To determine whether the test centre significantly affects pass rates, we perform a hypothesis test:

$$H_0: \beta_1 = 0$$ (the test centre has no effect on the pass rate)
$$H_1: \beta_1 \neq 0$$

The test statistic is given by:

$$
z = \frac{\hat{\beta}_1}{SE(\hat{\beta}_1)}
$$

where $$SE(\hat{\beta}_1)$$ is the standard error of $$\hat{\beta}_1$$. Under $$H_0$$, $$z$$ follows a standard normal distribution. The p-value is calculated as: $$P(\lvert Z \rvert > z)$$ where $$Z \sim N(0,1)$$.

At a significance level of 5%, $$H_0$$ is rejected if the p-value is less than 0.05, indicating that the test centre has a significant effect on pass rates.

## Model Summary

Below is a summary of the trained logistic regression model: 

```
Call:
glm(formula = cbind(Passes, not_passes) ~ centre_num, family = binomial, 
    data = model_train_data)

Coefficients:
            Estimate Std. Error z value Pr(>|z|)   
(Intercept)  0.17621    0.06696   2.631  0.00850 **
centre_num  -0.24734    0.08410  -2.941  0.00327 **
---
Signif. codes:  0 ‘***’ 0.001 ‘**’ 0.01 ‘*’ 0.05 ‘.’ 0.1 ‘ ’ 1

(Dispersion parameter for binomial family taken to be 1)

    Null deviance:  8.6714e+00  on 1  degrees of freedom
Residual deviance: -2.4425e-14  on 0  degrees of freedom
AIC: 19.04

Number of Fisher Scoring iterations: 2
```

The logistic regression model indicates, $$\hat{\beta}_1 = -0.24734$$. **This suggests that Wood Green has a higher pass rate than Crawley.**

Additionally, the **p-value associated with $$\hat{\beta}_1$$ is $$0.00327$$** which is less than the 5% significance level. This suggests evidence against the null hypothesis that the test centre has no association with the outcome of a driving test.

It is also worth noting that the p-value is small enough such that the conclusion is also statistically significant at the 1% significance level.

As a result, the null hypothesis is rejected in the analysis and it is concluded that **there is statistically significant evidence to suggest that the pass rate is higher at Wood Green than Crawley**. It is therefore recommended that XYZ take their test at Wood Green.

# Conclusion

This analysis compared the pass rates of two driving test centers, Crawley and Wood Green, to help find the optimal location for XYZ to take their driving test. Using historical data from 2022 to 2024 and focusing on 17-year-old male drivers, the expected pass rates were estimated to be **48.2% at Crawley** and **54.4% at Wood Green**. Logistic regression analysis further revealed a statistically significant difference between the two centers, with **Wood Green exhibiting a higher likelihood of passing at a 5% and 1% significance level**.

Based on the findings, **it is recommended that XYZ take their driving test at the Wood Green test center**. It is still worth noting the limitations of the dataset and assumptions used in this analysis, such as the independence of test outcomes and the exclusion of factors beyond age, gender, and test center. Future analyses could incorporate additional variables, explore time series methods, and test the robustness of assumptions to enhance the reliability of recommendations.

While the analysis supports choosing Wood Green, XYZ should also consider practical factors such as how prepared they feel and their familiarity with test routes when making their decision.
