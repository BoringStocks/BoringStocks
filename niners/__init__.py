from flask import Flask

app = Flask(__name__, static_folder="")

from niners import views  # nopep8
