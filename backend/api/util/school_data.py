import requests


def fetch_university_data(url):
  response = requests.get(url)
  if response.status_code == 200:
    return response.json()
  else:
    response.raise_for_status()
    return []


def map_domains_to_colleges(university_data):
  domain_college_map = {}
  for university in university_data:
    name = university.get("name")
    domains = university.get("domains", [])
    for domain in domains:
      domain_college_map[domain] = name
  return domain_college_map


def fetch_and_map_domains():
  url = "https://raw.githubusercontent.com/Hipo/university-domains-list/refs/heads/master/world_universities_and_domains.json"
  university_data = fetch_university_data(url)
  return map_domains_to_colleges(university_data)


def main():
  url = "https://raw.githubusercontent.com/Hipo/university-domains-list/refs/heads/master/world_universities_and_domains.json"
  university_data = fetch_university_data(url)
  domain_college_map = map_domains_to_colleges(university_data)
  for domain, college in list(domain_college_map.items())[:5]:
    print(f"{domain}: {college}")


if __name__ == "__main__":
  main()
