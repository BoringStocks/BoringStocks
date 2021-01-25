import os
import requests
import json
import random
import re
from bs4 import BeautifulSoup as bs
import html5lib
from datetime import datetime
import time
from dotenv import load_dotenv
import schedule
from multiprocessing import Process
import sys

def scrape_stock():
    stock_symbol = (input('Input stock symbol: ').upper())
    print(f'{stock_symbol} selected')

    url = f'https://finance.yahoo.com/quote/{stock_symbol}?p={stock_symbol}&.tsrc=fin-srch'

    r = requests.get(url)
    page_content = bs(r.content, features='html5lib')
    data_table = page_content.find("div", attrs={"id": "quote-summary"})

    open_value = data_table.find('td', attrs={'data-test': 'OPEN-value'})
    parse_open = (open_value.find('span')).string
    print(f'Opened at ${parse_open}')

scrape_stock()