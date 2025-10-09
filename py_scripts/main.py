from fastapi import FastAPI
from pydantic import BaseModel
from get_info import query_entity , entity_details # your logic file
import uvicorn

app = FastAPI()

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


