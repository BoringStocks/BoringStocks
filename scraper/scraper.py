import requests
import json
from bs4 import BeautifulSoup as bs
import html5lib
from datetime import datetime, date
import time
import json

class Scraper:

    def __init__(self, target):
        self.target = target.upper()
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
                self.dict['symbol'] = self.target
                print('Scrape successful\n')

            except:
                print('ERROR SCRAPING DATA TABLE CATEGORIES - typo in parse targets?')
                exit()
        
        except:
            print('ERROR SCRAPING DATA TABLE - invalid stock?')
            exit()


    def get_name(self):
        '''Parse self.page_content for stock name, return self.stock_name'''

        self.stock_name = self.page_content.find('h1', attrs={'data-reactid': '7'}).string
        self.dict['stock name'] = self.stock_name


    def get_time(self):
        '''Return self.scrape_time'''

        self.scrape_time = (datetime.utcnow()).strftime("%H:%M:%S")
        self.dict['scrape time'] = self.scrape_time + ' UTC'


    def get_open(self):
        '''Parse self.parse_open for open price, return self.open'''

        self.open = (self.parse_open.find('span')).string
        self.dict['open'] = self.open

    
    def get_points_change(self):
        '''Parse self.parse_points_close (this is a list, close is index 1) for previous close, return self.points_change'''

        self.points_change = (self.parse_points_close.contents[1]).string
        self.dict['points change'] = self.points_change


    def get_current(self):
        '''Parse self.parse_points_close (this is a list, current price is index 0) for previous close, return self.current'''

        self.current = (self.parse_points_close.contents[0]).string
        self.dict['current'] = self.current


    def get_cap(self):
        '''Parse self.parse_cap for market cap, return self.cap'''

        self.cap = (self.parse_cap.contents[0]).string
        self.dict['cap'] = self.cap

    
    def get_volume(self):
        '''Parse self.parse_volume for volume, return self.volume'''

        self.volume = (self.parse_volume.find('span')).string
        self.dict['volume'] = self.volume

    
    def get_avg_volume(self):
        '''Parse self.parse_avg_volume for average volume, return self.avg_volume'''

        self.avg_volume = (self.parse_avg_volume.find('span')).string

        # def human_format(num):
        #     self.num = num
        #     self.magnitude = 0
        #     while abs(self.num) >= 1000:
        #         self.magnitude += 1
        #         self.num /= 1000.0
        #     return '{}{}'.format('{:f}'.format(num).rstrip('0').rstrip('.'), ['', 'K', 'M', 'B', 'T'][self.magnitude])

        # self.human_readable = human_format(float(self.avg_volume))
        # print(f'Human Readable: {self.human_readable}')
        self.dict['avg volume'] = self.avg_volume

    
    def get_embed(self):
        '''Create iframe for embed using input stock symbol'''

        self.embed_link = f'https://public.com/stocks/{self.target}/embed'
        self.embed_data = requests.get(self.embed_link)
        self.embed_content = bs(self.embed_data.content, features='html5lib')
        self.dict['embed content'] = self.embed_content


def get_all(stock_obj):
    '''Create and call all parse methods on Scraper object'''

    stock_obj.scrape_page()
    stock_obj.get_name()
    stock_obj.get_time()
    stock_obj.get_current()
    stock_obj.get_open()
    stock_obj.get_points_change()
    stock_obj.get_cap()
    stock_obj.get_volume()
    stock_obj.get_avg_volume()
    stock_obj.get_embed()
    
    for k, v in stock_obj.dict.items():
        print(f'{k}: {v}')


# ---------- TESTING ----------
stock_obj = Scraper(input('Stock query: '))
get_all(stock_obj)