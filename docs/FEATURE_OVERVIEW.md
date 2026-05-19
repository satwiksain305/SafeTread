# SafeTread Feature Overview

SafeTread is designed to be an end-to-end, user-friendly platform for AI-driven tire safety.

## 1. AI-Powered Wear Detection
The core feature of the platform. Users upload a picture of their tire tread, and our custom-trained Convolutional Neural Network (CNN) analyzes the tread depth and wear patterns. The system outputs a highly accurate "Health Score" and categorizes the tire as Healthy, Warning, or Critical.

## 2. Visual Explainability (GradCAM Heatmaps)
To build trust with the user, the AI isn't a "black box." Every prediction includes a GradCAM heatmap image overlaid on the user's tire. This shows exactly which parts of the tread the AI looked at to make its decision.

## 3. Gemini AI Insights
Beyond a simple "Healthy" or "Critical" label, the system integrates with Google's Gemini AI to generate a personalized, natural-language safety insight explaining the real-world implications of the tire's condition (e.g., "Your tread is low, which severely impacts wet braking distance.").

## 4. PDF Report Generation & Email Dispatch
Authenticated users automatically receive a highly detailed, professional PDF report sent to their email address within seconds of an analysis. This report contains the timestamp, heatmap, AI insight, and recommended next steps.

## 5. Local AI Gatekeeper
To prevent the system from returning nonsensical results if a user uploads a picture of a cat or a steering wheel, a lightweight MobileNetV2 AI model acts as a gatekeeper. It instantly rejects non-tire images before they consume heavy processing power in the main pipeline.

## 6. Guest Demo with IP Tracking
Users can try the AI without creating an account. The system tracks guest usage via IP address, allowing a limited number of "free trials" before prompting them to register for a full account.

## 7. Historical Dashboard
Registered users have access to a dashboard displaying their complete history of tire checks. They can view past health scores, compare degradation over time, and re-download old PDF reports at any time.
