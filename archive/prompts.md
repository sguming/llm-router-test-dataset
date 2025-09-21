# 📘 Prompts for Dataset Generation

This document records the main prompts used to generate the **LLM Router Test Dataset**.  
The goal was to create a gold truth dataset and a noisy (loose) variant for testing LLM-based intent routing.

---

## 📝 Step 1 — Define Dataset Structure
```plaintext
I want to create an intent classification dataset with 4 intents:
- book_flight
- cancel_booking
- check_order
- chit_chat

Generate 1000 samples (250 per intent).
Format as JSON with fields: id, text, intent.
