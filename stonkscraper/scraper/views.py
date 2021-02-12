from scraper import app
from flask import render_template, request, send_file
from .scraper import Scraper
import json
from datetime import datetime

@app.route('/')
def home():
    """Displays the homepage with forms for current or historical data."""

    return "hello"

@app.route('/<ticker>')
def get_all(ticker):
    stock = Scraper(ticker)

    return stock.get_all()


@app.route('/<ticker>/name')
def get_name(ticker):
    stock = Scraper(ticker)
    stock.scrape_page()

    if stock.page_content == False:
        return 'ERROR'

    return stock.get_one('name')


@app.route('/<ticker>/current')
def get_current(ticker):

    # Unpack json to parse time
    unpacked_json = open('data.json')
    data = json.load(unpacked_json)

    format = "%H:%M:%S"
    old_time = data['time']
    new_time = (datetime.utcnow()).strftime(format)
    
    time_delta = datetime.strptime(new_time, format) - datetime.strptime(old_time, format)    
    
    
    # Return old/new scrape depending on time_delta between scrapes
    if time_delta.total_seconds() > 5:

        # return new current, write new data into json
        print('Returning new scrape')
        stock = Scraper(ticker)
        stock.scrape_page()

        if stock.page_content == False:
            return 'ERROR'

        new_current = stock.get_one('current')

        print(f'{time_delta.total_seconds()} seconds since last scrape')
        print(f'Writing new current data to json: {new_current}')
        with open('data.json', 'w') as stock_json:
            json.dump(new_current, stock_json)

        return stock.get_one('current')
    else:
        # return old current
        print('Returning old scrape')
        return data['current']