from cities import cities
import asyncio
import aiohttp
import re

def build_url(cid):
    return f"https://travel.state.gov/content/travel/resources/database/database.getVisaWaitTimes.html?cid={cid}&aid=VisaWaitTimesHomePage"


async def send_get_request(session, url):
    async with session.get(url) as resp:
        text = await resp.text()
        return text


headers = [
    "City",
    "Visitor Visa",
    "Student/Exchange Visitor Visas",
    "All Other Nonimmigrant Visas"
]

results = []
    

def print_wait_times(wait_times, city, f):
    wait_times = re.sub(r'\r\n|\n|\r', "", wait_times)
    wait_times = re.sub(r'[a-zA-Z ]+', "", wait_times)
    wait_times = wait_times.split(",")[0:3]
    str_wait_times = ','.join([city] + wait_times)
    print(str_wait_times)
    f.write(f'\n{str_wait_times}')


async def async_request(session, url, city, f):
    result = await send_get_request(session, url)
    print_wait_times(result, city, f)


async def main():
    f = open("results.csv", "w")
    f.write(f"{','.join(headers)}")
    session = aiohttp.ClientSession()
    loop = asyncio.get_event_loop()
    for city in cities:
        loop.create_task(async_request(session, build_url(city.get("code")), city.get("value"), f))
        await asyncio.sleep(0.1)
    f.close()


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())