import os
import pprint
import jinja2
from flask import Flask, render_template, request, send_file


################################################################################
# SETUP
################################################################################

app = Flask(__name__)

################################################################################
# ROUTES
################################################################################


@app.route('/')
def home():
    """Displays the homepage with forms for current or historical data."""

    return render_template('home.html')


if __name__ == '__main__':
    app.run(debug=True)
