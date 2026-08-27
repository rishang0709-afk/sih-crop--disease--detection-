# ML Model Service

> **Phase 4** will build this service.

This directory will contain:
- Fine-tuned EfficientNet/MobileNet model (PyTorch) trained on PlantVillage + IP102 datasets
- FastAPI inference microservice: `POST /predict` → `{ disease, confidence, action_category }`
- Model versioning and inference logging
- Low-confidence flagging (`confidence < 0.70` → `needs_expert_review: true`)

For now, see [PHASE1_AUTH.md](../docs/PHASE1_AUTH.md) for the current auth setup.
