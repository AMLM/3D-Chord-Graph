# -*- coding: UTF-8 -*-


#  ----------  Modules for import  ----------
import sys
import json
import time
import wmi
import pickle
import os
import os.path
import configparser
from winregal import RegKey
from requests import get
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import Flask, request, render_template, flash, redirect, url_for
from pymongo import MongoClient
import pymongo


#  ----------  Functions  ----------
# Function which shuts down the program
def shutdown():
    print(f'> Exiting...')
    sys.exit()


#  ----------  Main  ----------
if __name__ == '__main__':
    # The main function of the program that are ran at start up

    # Initialising startup variables
    current_path = os.path.dirname(os.path.abspath(__file__))


    # Beginning loading
    print(f'> This is 3D Chord Program example...')
    print(f'> Start initiated...')

    # Check for data folder
    if os.path.exists(current_path + "\data"):
        print(f'> Data folder found...')
    else:
        print(f'> Data folder not found!')
        shutdown()



    # Loading the main data file
    print(f'> Loading data from file...')
    try:
        with open('data/2019.json', encoding="utf8") as f:
            data_2019 = json.load(f)
        with open('data/2021.json', encoding="utf8") as f:
            data_2021 = json.load(f)
        print(f'> Success...')
    except Exception as error:
        print(f'> Data file loading failed. Reason: {error}...')
        shutdown()

    # Connecting to the database
    print(f'> Loading database...')
    try:
        DBclient = MongoClient("mongodb://localhost:27017/")
        dbase = DBclient["graph_data_3d"]
        mycol = dbase["2019"]
        mycol = dbase["2021"]

    except Exception as error:
        print(f'> Database loading failed. Reason: {error}...')
        shutdown()



    DBclient = MongoClient("mongodb://localhost:27017/")
    dbase = DBclient["graph_data_3d"]
    if dbase["2019"].count_documents({}, limit = 1) == 0:
        print(f'> Database data loading failed. Reason: There is no data in the database, filling database with data...')
        collection_2019 = dbase["2019"]
        collection_2021 = dbase["2021"]
        collection_2019.insert_many(data_2019)
        collection_2021.insert_many(data_2021)



    app = Flask(__name__, template_folder='webserver', static_folder='webserver\static', static_url_path='')
    # Next, the flask application is being started up and giving couple of the folders that are needed
    print(f'> Starting up the web server...')

    # First and the main route
    @app.route('/')
    def home_page():
        return render_template('index.html')

    # Sets needed variables
    app.secret_key = '_5#y2L"F4Q8zfsdxec]/'


    # Route which simply allows to get all data from the database by specific year
    @app.route('/get_data', methods=['GET'])
    def return_data():
        if request.method == "GET":
            year_to_display = request.args.get('year')
            document_data = dbase[year_to_display].find({})

            filtered_data_array = []

            # Here we are removing not needed items, renaming of Cuisine is capital case and extracting country from address
            for document in document_data:
                if "_id" in document:
                    document.pop("_id")
                if "url" in document:
                    document.pop("url")
                if "Url" in document:
                    document.pop("Url")
                if "Cuisine" in document:
                    document["cuisine"] = document.pop("Cuisine")
                if "WebsiteUrl" in document:
                    document.pop("WebsiteUrl")
                if "Address" in document:
                    document["region"] = document["Address"].split(", ")[-1]
                    document.pop("Address")
                filtered_data_array.append(document)
            return json.dumps(filtered_data_array)

    # Setting the cache default and finally running the app
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    app.run(debug=True, port="8000")
