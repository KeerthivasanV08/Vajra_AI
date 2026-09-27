# Feature — Non-ML Spatial Candidate Generation

> **Implementation**: `backend/app/services/vajra/candidate_generation_service.py`

---

## 1. Overview & Non-ML Status

Candidate generation is a **non-ML spatial query process**. It queries the node repository to identify the Top-20 nearest physical withdrawal nodes (ATMs, Micro-ATMs, AePS CSPs) relative to Model 1's predicted trajectory coordinates.

---

## 2. Spatial Query Logic

1. **Input**: Predicted target latitude (`predicted_lat`) and longitude (`predicted_lon`).
2. **Geospatial Distance**: Calculates the Haversine distance in kilometers for all nodes in `node_repository`:
   $$\text{Haversine}(lat_1, lon_1, lat_2, lon_2) = 2r \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta lat}{2}\right) + \cos(lat_1)\cos(lat_2)\sin^2\left(\frac{\Delta lon}{2}\right)} \right)$$
3. **Shortlisting**: Sorts all valid terminal nodes by distance ascending and slices the Top-20 candidates.
4. **Vulnerability Pre-Attachment**: Attaches terminal vulnerability scores from Model 2.
5. **Output**: Passes Top-20 candidate shortlist to Model 4 for ML-based re-ranking.
