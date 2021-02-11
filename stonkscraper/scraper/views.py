from scraper import app
from flask import render_template, request, send_file
from .scraper import Scraper

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

    # Restructure for timestamp/name comparisons
    return stock.get_one('current')