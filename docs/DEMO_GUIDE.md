# SafeTread Demo Guide 🎬

## Pre-Demo Checklist
- [ ] Backend running (`python app.py`)
- [ ] Frontend running (`npm start` in frontend folder)
- [ ] MongoDB connection verified
- [ ] Test images ready (good & defective tyre samples)
- [ ] Model loaded (`best_model_finetuned.h5` in ml/models/)

## Demo Flow (5-7 minutes)

### 1. **Landing Page** (30 sec)
- Show clean UI, explain project purpose
- Highlight authentication system

### 2. **User Registration/Login** (30 sec)
- Create account or login
- Show JWT token authentication in action

### 3. **Upload & Analysis** (2 min)
- Upload a **good tyre** image
  - Show prediction: ~90%+ healthy
  - Show recommendation: "Good condition"
- Upload a **defective tyre** image
  - Show prediction: ~90%+ defective/critical
  - Show recommendation: "Immediate replacement"

### 4. **Dashboard & History** (1 min)
- Show real-time prediction history (auto-refreshes every 1 second)
- Highlight database persistence

### 5. **Technical Deep Dive** (2 min)
- **Backend**: Flask REST API, MongoDB Atlas, JWT auth
- **Frontend**: React 18, responsive design, real-time updates
- **ML Model**: ResNet50 transfer learning, 96% accuracy
  - Trained on 1,698 images (train/val/test split)
  - Binary classification (Good vs Defective)
  - Data augmentation (flip, rotate, zoom, contrast)

### 6. **Training Process** (1 min)
- Show Google Colab notebook
- Explain dataset structure (Good/Defective folders)
- Show training metrics: 96% test accuracy
- Confusion matrix: only 10 errors on 255 test images

## Key Talking Points

### **Problem Statement**
- Tyre wear is a critical safety issue
- Manual inspection is subjective and inconsistent
- Need automated, reliable detection

### **Solution**
- AI-powered image analysis using CNN
- Fast, accurate predictions (< 2 seconds)
- User-friendly interface for non-technical users

### **Technical Achievements**
✅ Full-stack development (React + Flask + MongoDB)
✅ Modern ML pipeline (ResNet50 transfer learning)
✅ Production-ready deployment with Docker support
✅ 96% model accuracy on real-world data
✅ Real-time dashboard with auto-refresh
✅ Secure authentication with JWT

### **Results**
- **Accuracy**: 96% on test set
- **Precision**: 97% for Good, 95% for Defective
- **Recall**: 95% for Good, 97% for Defective
- **False Negatives**: Only 4/130 defective tyres missed (3% miss rate)

## Demo Images to Prepare

1. **Good Tyres** (3-4 images)
   - Clear tread pattern, deep grooves
   - Expected: 80-100% healthy

2. **Defective Tyres** (3-4 images)
   - Worn tread, shallow grooves, cracks
   - Expected: 80-100% critical/defective

## Backup Plan
If live demo fails:
- Show pre-recorded video
- Walk through code architecture
- Show training notebook results from Colab

## Questions to Prepare For

**Q: How did you train the model?**
A: Used Google Colab GPU with ResNet50 transfer learning. Dataset: 1,698 images split into train/val/test. 25 epochs initial training + 8 epochs fine-tuning.

**Q: What's the accuracy?**
A: 96% test accuracy with balanced precision/recall. Only 10 misclassifications out of 255 test images.

**Q: How do you handle real-time predictions?**
A: TensorFlow model loaded once at startup, predictions take ~1-2 seconds per image.

**Q: Is this production-ready?**
A: Yes! Has authentication, database persistence, error handling, and can be containerized with Docker.

**Q: What would you improve?**
A: 
- Add more tyre types (winter, performance, truck)
- Implement wear percentage estimation (not just binary)
- Add mobile app for field inspections
- Integrate with vehicle management systems

## Time Estimates
- Quick demo: 3-5 minutes
- Full demo with Q&A: 10-15 minutes
- Technical deep-dive: 20-30 minutes
