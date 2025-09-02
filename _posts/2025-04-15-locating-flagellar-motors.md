---
layout: post
title: "Locating Bacterial Flagellar Motors in 3D Tomograms"
date: 2025-04-15
description: An object detection project inspired by a Kaggle competition for my "Deep Learning" module at LSE.
github: https://github.com/belowwind-islander
used: [Python, PyTorch, Computer Vision]
---

## Introduction

In this post, I will discuss the key findings from my research and implementation of deep learning methods to detect bacterial flagellar motors in 3D cryo-electron tomograms. 

This was a group project inspired by the Kaggle competition and was completed for my deep learning module. My primary contribution was researching, implementing and comparing state-of-the-art object detection models to automate the traditionally manual task of identifying molecular machines in noisy microscopy data. The goal was to classify 2D slices as containing flagellar motors or not, then precisely locate them. 

---

## The Data 

The dataset contained 362 bacterial tomograms with 451 annotated flagellar motors. Each tomogram is a 3D reconstruction from cryo-electron microscopy, where bacteria are flash-frozen to preserve molecular structure. The data presented several challenges:

1. Low signal-to-noise ratio (SNR ≈ 0.1-0.3) from the imaging process
2. Variable motor orientations across different bacteria
3. Small target size (~24 pixels in 512×512 slices)
4. Dense cellular environments creating motor-like patterns

For training, I extracted 9 consecutive z-axis slices around each annotated motor, creating 4,054 images (3,262 train, 792 validation). This captured 3D context while enabling 2D detection models.

<figure class="post-image">
  <img src="/img/posts/ST456/tomogram_slice.png" alt="Tomogram slice example" loading="lazy">
  <figcaption>Fig. 1: Cryo-ET slice showing bacterial flagellar motor (red marker).</figcaption>
</figure>


---

## A Brief Introduction into the Evolution of Object Detection

Object detection in computer vision has evolved significantly from traditional methods to modern deep learning approaches. This project builds upon several key developments in the field.

**R-CNN (2014-2017)**: Region-based Convolutional Neural Networks (R-CNN) established the foundation for modern object detection. R-CNN used selective search to generate region proposals, then classified each with a CNN. While effective, the multi-stage pipeline was computationally expensive, processing 2000 regions per image. Fast R-CNN and Faster R-CNN improved upon this by sharing convolutional features and introducing Region Proposal Networks (RPNs), reducing detection time from 49 seconds to 0.2 seconds per image.

**YOLO (2016-present)**: You Only Look Once (YOLO) fundamentally changed object detection by framing it as a single regression problem. Instead of region proposals, YOLO divides images into grids and directly predicts bounding boxes and class probabilities in a single forward pass. This enabled real-time detection at 45 FPS. Non-Maximal Suppression (NMS) is then employed in post-processing to select the highest confidence box and suppress boxes with high degrees of overlap measured by intersection over union (IoU). While effective, NMS is a fixed, non-learnable algorithm that can struggle with appropriate thresholds: too high causes duplicate detections, too low removes valid objects. Subsequent versions of YOLO (v2-v11) refined the architecture with improvements like anchor boxes, feature pyramid networks, and CSPDarknet backbones. YOLOv8, used in this project, introduced C2f modules for better gradient flow and SPPF for multi-scale context.

**Transformer-based Detection (2020-present)**: Detection with Transformers (DETR) eliminated hand-crafted components like NMS by treating detection as a set prediction problem. Using transformer encoders-decoders with learned object queries, DETR directly outputs final predictions through [Hungarian matching](https://en.wikipedia.org/wiki/Hungarian_algorithm). However, the original DETR suffered from slow convergence (500 epochs) and high computational cost. Real-Time Detection-Transformers (RT-DETR, 2023) addressed DETR's limitations through two key innovations:

1. Efficient Hybrid Encoder: Replaces pure transformer encoders with CNN-transformer hybrids, reducing computational cost while maintaining global reasoning
2. Uncertainty-Minimal Query Selection: Instead of random query initialization, selects high-confidence encoder features, accelerating convergence from 500 to ~50 epochs

These improvements made RT-DETR practical for real-time applications while retaining DETR's advantages.

---

## Key Findings  

### Model Performance Comparison

I implemented and compared multiple state-of-the-art detection architectures to identify the optimal approach for detecting flagellar motors in noisy tomographic data:


| Model | F2 Score | Precision | Recall | mAP@50 | Mean Euclidean Distance |
|:------|:--------:|:---------:|:------:|:------:|:-----------------------:|
| YOLOv8n | 0.868 | 0.857 | 0.871 | 0.901 | 27.88 px |
| YOLOv8m | 0.892 | 0.878 | 0.896 | 0.926 | 28.36 px |
| YOLOv11m | 0.867 | 0.834 | 0.875 | 0.914 | 26.61 px |
| **RT-DETR** | **0.926** | **0.880** | **0.938** | **0.946** | **22.54 px** |

<figure class="post-image">
  <figcaption>Fig. 2: Performance metrics across all models tested on validation sets.</figcaption>
</figure>

YOLOv8m achieved strong results with an F2 score of 0.892, demonstrating that its CSPDarknet backbone and C2f blocks provided sufficient depth for feature extraction. However, YOLOv11m, despite having similar parameters, showed signs of overfitting with lower performance metrics.

### Why RT-DETR Excelled

RT-DETR's superior performance (F2: 0.926, localization error: 22.54 px) can be attributed to three key factors:

1. **Global Context Understanding**: Transformers relate distant image regions, helping identify motors by cellular context rather than local features alone
2. **Adaptive Computation**: Query-based detection focuses processing on promising regions, reducing false positives in noisy backgrounds  
3. **End-to-End Learning**: Joint optimization of the entire detection pipeline avoids suboptimal hand-crafted components

The 4.7% recall improvement over YOLOv8m is particularly important for scientific applications where missing motors (false negatives) is more problematic than false positives.

### Training Insights

All models used consistent hyperparameters for fair comparison:
- Batch size: 16
- Epochs: 100  
- Optimizer: AdamW (lr=0.002, weight_decay=0.01)
- IoU threshold: 0.7 for positive assignment

Data augmentation was crucial given the limited training data:
- Random rotations up to 180° (motors can be any orientation)
- Horizontal/vertical flips (50% probability)
- Perspective transforms and translation
- MixUp augmentation (25% blend ratio) for regularization

RT-DETR converged faster than YOLO models, reaching optimal performance in ~60 epochs versus 80+ for YOLOv8m, demonstrating more efficient learning dynamics.

<figure class="post-image">
  <img src="/img/posts/ST456/PR_Curves.jpg" alt="PR Curves" loading="lazy">
  <figcaption>Fig. 3: Precision-Recall curves for RT-DETR (red), YOLOv8n (green), YOLOv8m (blue), YOLOv11m (magenta).</figcaption>
</figure>


---

## Limitations & Future Work  

Several limitations should be noted:

1. **2D Processing**: Using 2D slices loses 3D context that could improve detection accuracy.
2. **Single Structure Type**: Model trained only on flagellar motors, not other cellular structures.
3. **Small Sample Size**: Only 362 tomograms limited the model's exposure to variability.  The dataset size prevented creation of a separate holdout test set, meaning performance estimates rely on validation data that was used for model selection.
4. **Computational Cost**: RT-DETR requires 50% more inference time than YOLOv8m (18ms vs 12ms).

Future directions could include:
1. Implementing true 3D detection models operating directly on volumetric data
2. Multi-class detection for various molecular structures (ribosomes, pili, etc.)

---

## Conclusion  

This project explored state-of-the-art architectures for detecting flagellar motors in cryo-ET data, achieving **93.8% recall and 88% precision on validation data with RT-DETR**. RT-DETR significantly outperformed YOLO variants, with a 22.54 pixel localization error compared to 26-28 pixels for YOLO models.

The work demonstrates that transformer architectures, originally designed for natural language processing, excel at detecting small objects in scientific imaging where context and global reasoning are crucial. Validation performance that suggests the method could match expert annotation quality, though further testing on holdout data would be needed to confirm the model's ability to generalise.

With further research, this could accelerate structural biology research, enabling larger-scale studies that were previously infeasible due to annotation bottlenecks. The success of RT-DETR on this challenging task suggests similar approaches could benefit other scientific imaging domains requiring detection of small, noisy targets.


## Further Reading 

- <a href="{https://arxiv.org/abs/2304.08069}" target="_blank" class="underline-link link-lg">RT-DETR Paper</a>
- <a href="{https://docs.ultralytics.com/models/yolov8/}" target="_blank" class="underline-link link-lg">YOLOv8 Documentation</a>
- <a href="{https://arxiv.org/abs/2005.12872}" target="_blank" class="underline-link link-lg">DETR Paper</a>

Feel free to reach out with questions or feedback!