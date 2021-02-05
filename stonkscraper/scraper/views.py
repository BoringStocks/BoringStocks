from scraper import app
from flask import render_template, request, send_file


@app.route('/')
def home():
    """Displays the homepage with forms for current or historical data."""

    return "hello"
