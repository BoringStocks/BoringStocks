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
    stock = Scraper(ticker)
    stock.scrape_page()

    if stock.page_content == False:
        return 'ERROR'


    unpacked_json = open('data.json')
    data = json.load(unpacked_json)

    old_time = data['time']
    new_time = stock.get_time()
    format = "%H:%M:%S"
    time_delta = datetime.strptime(new_time, format) - datetime.strptime(old_time, format)
    
    # Return old/new scrape depending on time_delta between scrapes
    if time_delta.total_seconds() > 5:
        # return new current
        print('Returning new scrape')
        return stock.get_one('current')
    else:
        # return old current
        print('Returning old scrape')
        return data['current']