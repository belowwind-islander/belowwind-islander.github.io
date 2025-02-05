---
layout: post
title: "Classifying Immune Cells with Machine Learning"
date: 2024-12-11
description: Classification project for my "Machine Learning and Data Mining" module at LSE.
github: https://github.com/belowwind-islander
used: [R, Logistic Regression, Principal Component Analysis]
---
## Introduction

In this post, I’ll walk through the **approach, key findings, and insights** from applying statistical learning methods to biological data. 

This was a group project completed for the "Machine Learning and Data Mining" module at LSE (ST443). My primary contribution was tackling a **binary classification problem** involving real-world RNA expression data. The goal was to classify immune cells into **T regulatory cells (TREG)** or **CD4+T cells**, a distinction that has important implications in autoimmune research. I performed **exploratory data analysis (EDA), trained multiple classifiers, and optimized model performance**—focusing on improving the **F1 score** through techniques such as **principle component analysis, cross-validation and hyperparameter tuning.**

## Dataset

The dataset contained **5,471 observations (n) of with 4,123 RNA expression measurements (p)**, making this a high-dimensional classification problem. It is worth noting that the data is made up of **2,115 TREG cells and 3,356 CD4+T cells**, meaning there is moderate class imbalance (39% TREG vs 61% CD4+T). For the purpose of classification, the TREG class will be taken as the positive outcome (ie. TREG = 1 and CD4+T = 0). There were no missing values so no imputation was needed. 

## Exploratory Analysis

Since there are many potential covariates to analyse, the inital approach for the EDA was to identify the genes with have the highest absolute difference between the mean of TREG cells’ expression level and the mean of CD4+T cells’ expression level. This allowed me to analyse potential covariates with high explanatory power. Taking boxplots of the 10 genes with the largest differences in mean expression levels between TREG and CD4+T cells helped to highlight these differences and gain more insight into any overlaps. 

<figure class="post-image">
  <img src="/img/posts/ST443/boxplot.png" alt="Description" loading="lazy">
  <figcaption>Fig. 1: Boxplot of 10 Genes</figcaption>
</figure>

As seen in Fig. 1 above, all the plotted gene expressions show slight overlap between the TREG and CD4+T cells. This suggests that the decision boundary between the two classes in not linearly separable in the feature space, which implications are two-fold. 

**1. Without data preprocessing, non-linear models will perform better vs linear models.**

**2. Dimensionality reduction techniques can help to focus on the most informative features.**

## Model Training and Selection

First the models were evaluated on raw data with and without PCA. 

| Model w/o PCA  | Accuracy   | Bal. Accuracy | AUC        | F1         |
|:----------|:------------:|:------------:|:------------:|:------------:|
| LDA      | 0.9416     | 0.9407        | 0.9407     | 0.9238 |
| Logistic | 0.6393     | 0.6413        | 0.6597     | 0.5766     |
| QDA      | N/A        | N/A           | N/A        | N/A        |
| k-NN     | 0.7425     | 0.6964        | 0.6964     | 0.5983     |
| GBDT     | 0.9087     | 0.8887        | **0.9731** | 0.8698     |
| RF       | 0.9352     | 0.9171        | 0.9171     | 0.9077     |
| SVM      | **0.9553** | **0.9479**    | 0.9479     | **0.9394**     |

<figure class ="post-image">
    <figcaption>Fig. 2: Base model evaluations without PCA</figcaption>
</figure>

When dealing with high-dimensional data (p ≈ n, 4123 features vs. 5142 samples), model performances hinge on handling noise, sparsity, and feature redundancy. 

In Fig. 2, support vector machines (SVM) emerged as the top performer for most metrics due to its **linear kernel that can non-linear relationships in high-dimensional spaces and built-in L2 regularisation**, effectively capturing sparse signals and ignoring noise. Random forests (RF) and gradient boosting decision trees (GBDT) also excelled, leveraging feature selection and non-linearity to model gene interactions. Interestingly, the linear discriminant analysis (LDA) model also performed well, suggesting **that the decision boundary between the two cells in a lower-dimensional projection of the data is not highly complex**.

In contrast, logistic regression and k-NN struggled due to the noise of the data and QDA failed due to singular covariance matrices. These classifiers are likely to receive great benefit from dimensionality reduction such as principle component analysis (PCA), which can be observed below.

| Model w/ PCA            | Accuracy   | Bal. Accuracy | AUC        | F1         |
|:----------|:------------:|:------------:|:------------:|:------------:|
| LDA                 | 0.9352     | 0.9176        | 0.9892     | 0.9079     |
| Logistic            | 0.9489     | 0.9414        | **0.9913** | 0.9309     |
| QDA                 | 0.9416     | 0.9298        | 0.9876     | 0.9194     |
| k-NN                | 0.9187     | 0.8982        | 0.8982     | 0.8834     |
| GDBT                | 0.8703     | 0.8394        | 0.9483     | 0.8060     |
| RF                  | 0.9379     | 0.9259        | 0.9259     | 0.9144     |
| SVM (Linear Kernel) | 0.9489     | **0.9414**    | 0.9414     | 0.9309     |
| SVM (Radial Kernel) | **0.9498** | 0.9397        | 0.9397     | **0.9312** |


<figure class ="post-image">
    <figcaption>Fig. 3: Base model evaluations with PCA</figcaption>
</figure>

After applying PCA (Fig. 3), models that previously struggled, such as logistic regression and k-NN, saw significant improvements. Logistic regression achieved an AUC of 0.9913—one of the highest among all models, suggesting that PCA effectively removed noise and redundant features by making the dataset more linearly separable. However, tree-based models (RF, GBDT) experienced a performance drop, likely because PCA eliminated feature interactions crucial for decision-tree splits. 

QDA became a viable model due to the lower dimension feature space and performed competitively. LDA remained strong, reinforcing the idea that class separation in a lower-dimensional space is well-defined.

The biggest winner was SVM with a radial kernel, which outperformed all models with an accuracy of 0.9498 and F1-score of 0.9312, highlighting how non-linear models can fully leverage PCA’s transformation. This comparison underscores the importance of understanding how dimensionality reduction affects different learning algorithms in high-dimensional settings.