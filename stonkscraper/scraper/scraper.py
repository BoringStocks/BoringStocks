import requests
import json
from bs4 import BeautifulSoup as bs
import html5lib
from datetime import datetime, date

class Scraper:

    def __init__(self, target):
        self.target = target.upper()
        self.all_data_dict = {}
        self.dict = {}


    def scrape_page(self):
        '''Grab page content, store under self.page_content'''

        self.url = f'https://finance.yahoo.com/quote/{self.target}?p={self.target}&.tsrc=fin-srch'
        self.r = requests.get(self.url)
        self.page_content = bs(self.r.content, features='html5lib')

        # Detect scraping errors
        try:
            self.data_table = self.page_content.find("div", attrs={"id": "quote-summary"})

            # If data_table correctly scrapes, parse containers inside
            try:
                self.parse_open = self.data_table.find('td', attrs={'data-test': 'OPEN-value'})
                self.parse_points_close = self.page_content.find('div', attrs={'class' : 'D(ib) Mend(20px)'})
                self.parse_cap = self.data_table.find('td', attrs={'data-test': 'MARKET_CAP-value'})
                self.parse_volume = self.data_table.find('td', attrs={'data-test': 'TD_VOLUME-value'})
                self.parse_avg_volume = self.data_table.find('td', attrs={'data-test': 'AVERAGE_VOLUME_3MONTH-value'})
                self.all_data_dict['symbol'] = self.target
                print('Scrape successful\n')

            except:
                self.page_content = False
                print('ERROR SCRAPING DATA TABLE CATEGORIES - typo in parse targets?')
        
        except:
            self.page_content = False
            print('ERROR SCRAPING DATA TABLE - invalid stock?')


    def get_name(self):
        '''Parse self.page_content for stock name, return self.stock_name'''

        self.stock_name = self.page_content.find('h1', attrs={'data-reactid': '7'}).string
        self.dict['name'] = self.stock_name
        return self.stock_name


    def get_time(self):
        '''Return self.scrape_time'''

        self.scrape_time = (datetime.utcnow()).strftime("%H:%M:%S")
        self.all_data_dict['scrape time'] = self.scrape_time + ' UTC'
        return self.scrape_time


    def get_open(self):
        '''Parse self.parse_open for open price, return self.open'''

        self.open = (self.parse_open.find('span')).string
        self.all_data_dict['open'] = self.open
        return self.open

    
    def get_points_change(self):
        '''Parse self.parse_points_close (this is a list, close is index 1) for previous close, return self.points_change'''

        self.points_change = (self.parse_points_close.contents[1]).string

        # Split parsed string into list, i0 = points, i1 = percent
        split_data = (self.points_change).split('(')

        points = split_data[0]

        # Remove paranthese and % from percent string
        percent = split_data[1].replace('%)', '')

        # Store points and percent in dict
        self.points_percent = {}
        self.points_percent['points'] = points
        self.points_percent['percent'] = percent

        # Store dict in all_data_dict
        self.all_data_dict['points_change'] = self.points_percent

        return self.points_percent


    def get_current(self):
        '''Parse self.parse_points_close (this is a list, current price is index 0) for previous close, return self.current'''

        self.current = (self.parse_points_close.contents[0]).string
        self.all_data_dict['current'] = self.current
        return self.current


    def get_cap(self):
        '''Parse self.parse_cap for market cap, return self.cap'''

        self.cap = (self.parse_cap.contents[0]).string
        self.all_data_dict['cap'] = self.cap
        return self.cap

    
    def get_volume(self):
        '''Parse self.parse_volume for volume, return self.volume'''

        self.volume = (self.parse_volume.find('span')).string
        self.all_data_dict['volume'] = self.volume
        return self.volume

    
    def get_avg_volume(self):
        '''Parse self.parse_avg_volume for average volume, return self.avg_volume'''

        self.avg_volume = (self.parse_avg_volume.find('span')).string
        self.all_data_dict['avg volume'] = self.avg_volume
        return self.avg_volume

    
    def get_embed(self):
        '''Create iframe for embed using input stock symbol'''

        self.embed_link = f'https://public.com/stocks/{self.target}/embed'
        self.embed_data = requests.get(self.embed_link)
        self.embed_content = bs(self.embed_data.content, features='html5lib')
        self.all_data_dict['embed content'] = str(self.embed_content)


    def get_all(self):
        '''Create and call all parse methods on Scraper object'''

        self.scrape_page()
        self.all_data_dict['name'] = self.get_name()
        self.all_data_dict['time'] = self.get_time()
        self.all_data_dict['current'] = self.get_current()
        self.all_data_dict['open'] = self.get_open()
        self.all_data_dict['points_change'] = self.get_points_change()
        self.all_data_dict['cap'] = self.get_cap()
        self.all_data_dict['volume'] = self.get_volume()
        self.all_data_dict['avg volume'] = self.get_avg_volume()


        with open('data.json', 'w') as stock_json:
            json.dump(self.all_data_dict, stock_json)

        return self.all_data_dict

    
    def get_one(self, method):
        '''Call one method'''

        self.scrape_page()

        if method == 'name':
            self.dict['name'] = self.get_name()
        elif method == 'time':
            self.dict['time'] = self.get_time()
        elif method == 'current':
            self.dict['current'] = self.get_current()
            self.dict['points_change'] = self.get_points_change()
            self.dict['time'] = self.get_time()
        elif method == 'open':
            self.dict['open'] = self.get_open()
        elif method == 'cap':
            self.dict['cap'] = self.get_cap()
        elif method == 'volume':
            self.dict['volume'] = self.get_volume()
        elif method == 'avg_vol':
            self.dict['avg volume'] = self.get_avg_volume()
        else:
            self.dict['error'] = 'Incorrect method call'

        return self.dict