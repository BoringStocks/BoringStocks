import os
import requests
import json
import random
import re
from bs4 import BeautifulSoup as bs
import html5lib
from datetime import datetime, date
import time
import sys
import json

def scrape_stock(target):

    data = {}

    data['scrape time'] = (datetime.utcnow()).strftime("%H:%M:%S")
    data['today'] = (datetime.today()).strftime("%B %d, %Y")

    url = f'https://finance.yahoo.com/quote/{target}?p={target}&.tsrc=fin-srch'

    r = requests.get(url)
    page_content = bs(r.content, features='html5lib')

    # Check for valid symbol
    try:
        data_table = page_content.find("div", attrs={"id": "quote-summary"})
    except:
        return False

    # Parse various containers
    parse_open = data_table.find('td', attrs={'data-test': 'OPEN-value'})
    parse_points_close = page_content.find('div', attrs={'class' : 'D(ib) Mend(20px)'})
    parse_cap = data_table.find('td', attrs={'data-test': 'MARKET_CAP-value'})

    # Further parse containers and extract strings
    data['stock name'] = (page_content.find('h1', attrs={'data-reactid': '7'})).string
    data['points change'] = (parse_points_close.contents[1]).string
    data['open'] = (parse_open.find('span')).string
    data['close'] = (parse_points_close.contents[0]).string
    data['cap'] = (parse_cap.contents[0]).string

    with open('data.json', 'w') as stock_json:
        json.dump(data, stock_json)


# ----------------  FUNCTION TESTING  ----------------
scrape_stock(input('Input stock symbol: '))

unpacked_json = open('data.json')
data = json.load(unpacked_json)

print(f'''
    {data['stock name']} {data['today']}
    • Open: ${data['open']}
    • Close: ${data['close']}
    • From previous close: {data['points change']}
    • Market cap: ${data['cap']}
    • Updated {data['scrape time']} UTC
''')