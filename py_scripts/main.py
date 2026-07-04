from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from get_info import query_entity, entity_details, check_inactive_entities
from prediction_pipeline import CampusLocationPredictor
import pandas as pd
import numpy as np
import threading

app = FastAPI()

# Initialize global predictor with thread safety
predictor = None
predictor_lock = threading.Lock()

class TrainRequest(BaseModel):
    data_dir: str = "data"
    time_window_hours: int = 2
    n_clusters: int | None = None
    decay_half_life_hours: float = 2.0
    nearby_window_radius: int = 2

class PredictRequest(BaseModel):
    entity_id: str
    timestamp: str

class QueryInput(BaseModel):
    identifier_type: str
    identifier_value: str
    start_time: str | None = None
    end_time: str | None = None
    location: str | None = None

def to_serializable(obj):
    """Convert numpy/pandas types to JSON-serializable Python types."""
    # Check for None first
    if obj is None:
        return None
    # Check collections before scalar checks
    elif isinstance(obj, dict):
        return {k: to_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [to_serializable(item) for item in obj]
    elif isinstance(obj, (np.ndarray,)):
        return obj.tolist()
    # Check specific pandas/numpy types
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    elif isinstance(obj, (np.int32, np.int64, np.integer)):
        return int(obj)
    elif isinstance(obj, (np.float32, np.float64, np.floating)):
        return float(obj)
    elif isinstance(obj, (np.bool_)):
        return bool(obj)
    # Check for NaN only on scalar values
    elif isinstance(obj, (float, np.floating)) and pd.isna(obj):
        return None
    else:
        return obj

@app.post("/run-query")
def run_query(input: QueryInput):
    # Query entity without writing files (API returns data in-memory)
    user_input = {
        "identifier": {input.identifier_type: input.identifier_value},
        "start_time": input.start_time,
        "end_time": input.end_time,
        "location": input.location
    }
    print(f"Received /run-query request: {user_input}")
    result = query_entity(user_input, save_to_disk=False)

    if result is None:
        print(f"/run-query: entity not found for input: {user_input}")
        raise HTTPException(status_code=404, detail="Entity not found::()")
    
    # Clean the result to ensure JSON serialization
    clean_result = to_serializable(result)
    print(f"/run-query success: serialized result prepared")
    return {"status": "success", "data": clean_result}

@app.post("/details")
def details(input: QueryInput):
    user_input = {
        "identifier": {input.identifier_type: input.identifier_value},
    }
    print(f"Received /details request: {user_input}")
    result = entity_details(user_input)
    print(f"/details success: {result}")
    return {"status": "success", "details": result}


@app.post("/train")
def train_model(req: TrainRequest):
    global predictor
    print(f"Received /train request: {req.model_dump()}")
    with predictor_lock:
        predictor = CampusLocationPredictor(
            data_dir=req.data_dir,
            time_window_hours=req.time_window_hours,
            n_clusters=req.n_clusters,
            decay_half_life_hours=req.decay_half_life_hours,
            nearby_window_radius=req.nearby_window_radius
        )
        try:
            predictor.load_and_integrate_data()
            predictor.temporal_aggregation()
            predictor.build_feature_matrix_and_cluster()
            predictor.build_cluster_prob_table()
            print(f"/train success: model trained")
            return {"status": "success", "message": "Model trained successfully!"}
        except Exception as e:
            print(f"/train failed: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict")
def predict_location(req: PredictRequest):
    """
    Predicts the most probable location for a given entity and timestamp.
    """
    global predictor
    print(f"Received /predict request: entity_id={req.entity_id} timestamp={req.timestamp}")
    with predictor_lock:
        if predictor is None:
            print(f"/predict called before model training")
            raise HTTPException(status_code=400, detail="Model not trained yet. Call /train first.")

        try:
            result = predictor.predict_location(req.entity_id, req.timestamp)
            clean_result = to_serializable(result)
            print(f"/predict success: {clean_result}")

            return {
                "entity_id": req.entity_id,
                "timestamp": req.timestamp,
                **clean_result
            }
        except Exception as e:
            print(f"/predict failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/alerts/inactive")
def get_inactive_alerts():
    try:
        print(f"Received /alerts/inactive request")
        inactive = check_inactive_entities()
        print(f"/alerts/inactive success: count={len(inactive)}")
        return {"status": "success", "alerts": inactive, "count": len(inactive)}
    except Exception as e:
        print(f"/alerts/inactive failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


