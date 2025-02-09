import requests
from requests.structures import CaseInsensitiveDict
from dotenv import load_dotenv
import os

load_dotenv()

autocomplete_api_key = os.getenv('AUTOCOMPLETE_API_KEY')

# def get_coordinates(location_name, api_key):
#     base_url = "https://maps.googleapis.com/maps/api/geocode/json"
#     params = {
#         'address': location_name,
#         'key': api_key
#     }
#     response = requests.get(base_url, params=params)
#     if response.status_code == 200:
#         data = response.json()
#         if data['results']:
#             lat = data['results'][0]['geometry']['location']['lat']
#             lng = data['results'][0]['geometry']['location']['lng']
#             return lat, lng
#         else:
#             return None, None
#     else:
#         print(f"Error: {response.status_code}")
#         return None, None

# location_name = 'New'
# if __name__ == "__main__":
#   latitude, longitude = get_coordinates(location_name, api_key)

#   if latitude and longitude:
#     print(f"Coordinates of {location_name}: Latitude = {latitude}, Longitude = {longitude}")
#   else:
#     print(f"Location {location_name} not found.")
    
def autocomplete_location(query):
    url = f"https://api.geoapify.com/v1/geocode/autocomplete?text={query}&apiKey={autocomplete_api_key}"
    headers = CaseInsensitiveDict()
    headers["Accept"] = "application/json"
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if "features" in data and data["features"]:
            top_feature = data["features"][0]
            coordinates = top_feature["geometry"]["coordinates"]
            longitude = coordinates[0]
            latitude = coordinates[1]
            return latitude, longitude
        else:
            print("No results found")
    print(f"Error: {response.status_code}")
    return None
    

query = 'Mcdonnell Hall Princeton University'
autocomplete_results = autocomplete_location(query)

if autocomplete_results:
    print(autocomplete_results)
else:
    print(f"No results found for query: {query}")
