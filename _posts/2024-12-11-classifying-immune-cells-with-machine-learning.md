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

This was a group project completed for the "Machine Learning and Data Mining" module at LSE (ST443). My primary contribution was tackling a **binary classification problem** involving real-world RNA expression data. The goal was to classify immune cells into **T regulatory cells (TREG)** or **CD4+T cells**, a distinction that has important implications in autoimmune research. I performed **exploratory data analysis (EDA), trained multiple classifiers, and optimized model performance**—focusing on improving the **F1 score** through techniques such as **dimensionality reduction, cross-validation and hyperparameter tuning.**

## Dataset

The dataset contained **RNA expression measurements for 4,123 genes (p) across 5,471 cells (n)**, making this a high-dimensional classification problem. It is worth noting that the data is made up of **3,356 CD4+T cells and 2,115 TREG cells**. For the purpose of classification, the TREG class will be taken as the positive outcome (ie. TREG = 1 and CD4+T = 0).