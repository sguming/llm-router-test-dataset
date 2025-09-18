# LLM Router Test Dataset

## Overview
This repository contains a **gold truth intent classification dataset** and a **loose variant** for testing the robustness of **LLM-based intent routing** systems.  

- **Total samples**: 1000  
- **Intents**:  
  1. `book_flight` — user requests to book a flight  
  2. `cancel_booking` — user requests to cancel a booking or ticket  
  3. `check_order` — user queries order or booking status  
  4. `chit_chat` — user engages in small talk or non-task-oriented dialogue  
- **Language**: English  
- **Balance**: 250 samples per intent  

## Files
- `gold_truth_en.json` → Standard English dataset (1000 samples)  
- `gold_truth_en_loose.json` → Noisy version (one random word dropped per query)  

## Format
Each sample contains an ID, the user query (`text`), and the intent label:  

```json
{
  "id": "e00001",
  "text": "I want to book a business flight ticket from Shenzhen to Hefei tomorrow evening.",
  "intent": "book_flight"
}
