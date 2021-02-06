from flask import Flask

app = Flask(__name__, static_folder="")

from scraper import views  # nopep8
