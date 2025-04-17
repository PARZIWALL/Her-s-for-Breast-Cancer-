# import the inference-sdk
from inference_sdk import InferenceHTTPClient

# initialize the client
CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="i0CV9CLQq4Ov5WqIiYHW"
)
def check(img):
    # infer on a local image
    result = CLIENT.infer(img, model_id="early-detection-xvxmf/1")
    print(result)  # Debugging: Print the result to understand its structure
    return result
    # print(result)
