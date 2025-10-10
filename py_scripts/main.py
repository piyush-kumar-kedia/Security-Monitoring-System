from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from get_info import query_entity , entity_details, check_inactive_entities # your logic file
from prediction_pipeline import CampusLocationPredictor
import pandas as pd
import uvicorn
import numpy as np
from fastapi.encoders import jsonable_encoder

app = FastAPI()

# Initialize global predictor
predictor = None


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

@app.post("/run-query")
def run_query(input: QueryInput):
    user_input = {
        "identifier": {input.identifier_type: input.identifier_value},
        "start_time": input.start_time,
        "end_time": input.end_time,
        "location": input.location
    }
    result = query_entity(user_input)
    return {"status": "success", "timeline": result}

@app.post("/details")
def details(input: QueryInput):
    user_input = {
        "identifier": {input.identifier_type: input.identifier_value},
    }
    result = entity_details(user_input)
    return {"status": "success", "details": result}

# @app.get("/predict/{entity_id}")
# def predict(entity_id: str):
#     result = predict_entity(entity_id)
#     return result

@app.post("/train")
def train_model(req: TrainRequest):
    global predictor
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
        return {"status": "success", "message": "Model trained successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict")
def predict_location(req: PredictRequest):
    """
    Predicts the most probable location for a given entity and timestamp.
    """
    global predictor
    if predictor is None:
        raise HTTPException(status_code=400, detail="Model not trained yet. Call /train first.")

    try:
        result = predictor.predict_location(req.entity_id, req.timestamp)

        # Convert all numpy values to native Python types
        def to_serializable(val):
            if isinstance(val, (np.int32, np.int64)):
                return int(val)
            elif isinstance(val, (np.float32, np.float64)):
                return float(val)
            elif isinstance(val, (np.bool_)):
                return bool(val)
            else:
                return val

        clean_result = {k: to_serializable(v) for k, v in result.items()}

        return {
            "entity_id": req.entity_id,
            "timestamp": req.timestamp,
            **clean_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/alerts/inactive")
def get_inactive_alerts():
    try:
        inactive = check_inactive_entities()
        return {"status": "success", "alerts": inactive, "count": len(inactive)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


