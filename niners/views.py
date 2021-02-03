from flask import render_template, request, send_file
from niners import app
import jinja2
import pprint
import os


@app.route('/')
def home():
    """Displays the homepage with forms for current or historical data."""

    return render_template('home.html')
