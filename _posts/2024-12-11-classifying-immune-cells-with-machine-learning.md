---
layout: post
title: "Classifying Immune Cells with Machine Learning"
date: 2024-12-11
description: Classification project for my "Machine Learning and Data Mining" module at LSE.
github: https://github.com/belowwind-islander
used: [R, Logistic Regression, Principal Component Analysis, Cross-Validation, Hyperparameter Tuning]
---

## Introduction

In this post, I’ll walk through the **approach, key findings, and insights** from applying machine learning methods to biological data. 

This was a group project completed for the "Machine Learning and Data Mining" module at LSE (ST443). My primary contribution was tackling a **binary classification problem** involving real-world RNA expression data. The goal was to classify immune cells into **T regulatory cells (TREG)** or **CD4+T cells**, a distinction that has important implications in autoimmune research. I performed **exploratory data analysis (EDA), trained multiple classifiers, and optimized model performance**—focusing on improving the **F1 score** through techniques such as **principle component analysis, cross-validation and hyperparameter tuning.**

---

## Dataset

The dataset contained **5,471 observations (n) of with 4,123 RNA expression measurements (p)**, making this a high-dimensional classification problem. It is worth noting that the data is made up of **2,115 TREG cells and 3,356 CD4+T cells**, meaning there is moderate class imbalance (39% TREG vs 61% CD4+T). For the purpose of classification, the TREG class will be taken as the positive outcome (ie. TREG = 1 and CD4+T = 0). There were no missing values so no imputation was needed. 

---

## Exploratory Analysis

Since there are many potential covariates to analyse, the inital approach for the EDA was to identify the genes with have the highest absolute difference between the mean of TREG cells’ expression level and the mean of CD4+T cells’ expression level. This allowed me to analyse potential covariates with high explanatory power. Taking boxplots of the 10 genes with the largest differences in mean expression levels between TREG and CD4+T cells helped to highlight these differences and gain more insight into any overlaps. 

<figure class="post-image">
  <img src="/img/posts/ST443/boxplot.png" alt="Description" loading="lazy">
  <figcaption>Fig. 1: Boxplot of 10 genes</figcaption>
</figure>

As seen in Fig. 1 above, all the plotted gene expressions show slight overlap between the TREG and CD4+T cells. This suggests that the decision boundary between the two classes in not linearly separable in the current feature space, which implications are two-fold. 

1. **Without data preprocessing, non-linear models will perform better vs linear models.**

2. **Dimensionality reduction techniques can help to focus on the most informative features.**

---

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

In Fig. 2, Support Vector Machines (SVM) emerged as the top performer for most metrics due to its **linear kernel that can non-linear relationships in high-dimensional spaces and built-in L2 regularisation**, effectively capturing sparse signals and ignoring noise. Random Forests (RF) and Gradient Boosting Decision Trees (GBDT) also excelled, leveraging feature selection and non-linearity to classify well. Interestingly, Linear Discriminant Analysis (LDA) also performed well, suggesting that **the decision boundary between the two cells in a lower-dimensional projection of the data is not highly complex**.

In contrast, **Logistic Regression and k-NN struggled due to the noise of the data and QDA failed due to singular covariance matrices**. These classifiers are likely to receive great benefit from dimensionality reduction such as principle component analysis (PCA).

<figure class="post-image">
  <img src="/img/posts/ST443/screeplot.png" alt="Description" loading="lazy">
  <figcaption>Fig. 3: Scree plot of principle components</figcaption>
</figure>

We can see that approximately **10 principal components form the elbow of the scree plot** (Fig 3.), suggesting that around 10 principal components account for most of the variance within the data set which makes them powerful to use for prediction models. Model evaluations on these 10 principle components can be found below. 


| Model w/ PCA            | Accuracy   | Bal. Accuracy | AUC        | F1         |
|:----------|:------------:|:------------:|:------------:|:------------:|
| LDA                 | 0.9352     | 0.9176        | 0.9892     | 0.9079     |
| Logistic            | **0.9489** | **0.9414**    | **0.9913** | **0.9309** |
| QDA                 | 0.9416     | 0.9298        | 0.9876     | 0.9194     |
| k-NN                | 0.9187     | 0.8982        | 0.8982     | 0.8834     |
| GDBT                | 0.8703     | 0.8394        | 0.9483     | 0.8060     |
| RF                  | 0.9379     | 0.9259        | 0.9259     | 0.9144     |
| SVM                 | **0.9489** | **0.9414**    | 0.9414     | **0.9309** |


<figure class ="post-image">
    <figcaption>Fig. 4: Base model evaluations with PCA</figcaption>
</figure>

After applying PCA (Fig. 4), models that previously struggled, such as Logistic Regression and k-NN, saw significant improvements. Logistic regression achieved the highest AUC (0.9913) and F1-score, suggesting that **PCA effectively removed noise and redundant features** by making the dataset more linearly separable. However, tree-based models (RF, GBDT) experienced a performance drop, likely because **PCA eliminated feature interactions crucial for decision-tree splits.** 

QDA became a viable model due to the lower dimension feature space and performed competitively. LDA remained strong and performed as well as QDA, indicating that the **additional flexibility was not particularly beneficial** and reinforcing the idea that class separation in a lower-dimensional space is well-defined.

Interestingly, **Logistic Regression and SVM outperformed all models with identical performance metrics** (accuracy: 0.9489, balanced accuracy: 0.9414, F1-score: 0.9309), except AUC, after PCA. This happens because PCA reduced the dataset to its most informative dimensions, which allowed both models to learn a linear decision boundary as the optimal hyperplane. Before PCA, SVM had a clear advantage because it handles high-dimensional spaces better, whereas Logistic Regression struggled due to collinearity and irrelevant features. This demonstrates how **PCA can level the playing field for linear classifiers**, making Logistic Regression as effective as SVM. It is worth noting that the AUC is much higher for Logistic Regression because of its use of probabilities when assigning classes. 

---

## Model Tuning

From here I focus my efforts on improving the F1-score of the Logistic Regression model through **hyperparameter tuning, regularisation and cross-validation**. The hyperparameters tuned were:

1.	**Number of Principal Components (PCs)** – To balance dimensionality reduction with predictive power.
	
2.	**Decision Threshold** – To handle class imbalance by adjusting the trade-off between precision and recall.
	
3.	**Regularization Term (λ)** – To prevent overfitting while maintaining model generalization.

| Hyperparameters                                      | Range Cross-Validated                                  | Chosen Set   |
|------------------------------------------------------|--------------------------------------------------------|--------------|
| Principal Components         | `{10, 11, ..., 50}`|   `48`   |
| Decision Threshold | `{0.1, 0.2, ..., 0.9}` | `0.4` |
| Regularisation Term (λ) |  `{0, 0.001,0.001, 0.01, 1}` | `0.01` |

<figure class ="post-image">
    <figcaption>Fig. 5: the hyperparameters tested during tuning, their search ranges, and the final values chosen based on 5-fold cross-validation. </figcaption>
</figure>

Since Principal Component Analysis (PCA) was applied before model training, the features used were orthogonal, meaning multicollinearity was not a concern. However, choosing the right number of components was essential to prevent loss of predictive information. **48 principal components were selected**, ensuring that dimensionality was reduced without sacrificing performance. **Cross-validation showed that λ = 0.01 provided the best F1-score**, suggesting that while regularisation had a minor impact, it still helped improve generalisation slightly.

<figure class ="post-image">
    <img src="/img/posts/ST443/threshold.png" alt="Description" loading="lazy">
    <figcaption>Fig. 6: F1 Score vs Threshold for λ = 0.01 <br> </figcaption>
</figure>

When tuning the decision threshold (Fig. 6), it was found that 0.4 gave the optimal F1-score. This can be attributed to the class imbalance in the training set. **By lowering the threshold, the model achieved increased recall at a smaller cost of precision**. 

---

## Conclusion

This project demonstrated the effectiveness of machine learning in classifying immune cells using high-dimensional RNA expression data. By leveraging PCA for dimensionality reduction, I transformed the dataset into a lower-dimensional space where linear models like Logistic Regression excelled. **After hyperparameter tuning, the model scored a F1-score of 0.9510**. 

The key takeaways from this project:

1. **Dimensionality reduction matters**: PCA significantly improved model performance by eliminating noise and redundancy, enabling simpler models to compete with more complex ones.

2. **Class imbalance should be addressed**: Adjusting the decision threshold (from 0.5 to 0.4) improved recall for the minority class (TREG), improving the F1-score by balancing precision and recall effectively.

Future directions would explore tuning the SVM to see if it can outperform the Logistic Regression or, like previously, learn the same decision boundary.

Feel free to reach out with questions or feedback!