from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

import time

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from fastapi import FastAPI

import tkinter as tk


load_dotenv()

app = FastAPI()

MONGO_CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")

app.mongodb_client = MongoClient(MONGO_CONNECTION_STRING)

app.database = app.mongodb_client["productData"]

amzn_product_data = app.database["amazonProductData"]


# Initialize WebDriver
options = Options()
options.add_argument('--ignore-certificate-errors')
options.add_argument('--ignore-ssl-errors')
driver = webdriver.Chrome(options=options)
driver.get("https://www.amazon.com/Best-Sellers-Clothing-Shoes-Jewelry-Mens-Fashion/zgbs/fashion/7147441011/ref=zg_bs_nav_fashion_1")



scanned_asins = set()
def scan_elements():
    try:
        elements = WebDriverWait(driver, 10).until(
            EC.visibility_of_all_elements_located((By.CSS_SELECTOR, 'div[data-asin]'))
        )
        print(len(elements), "found")
        for element in elements:
            asin = element.get_attribute("data-asin")
            if asin is None or asin in scanned_asins: continue
            buybox = url = None
            
            try:
                buybox_element = element.find_element(By.CSS_SELECTOR, 'span.a-size-base')
                if buybox_element is None: continue
                buybox = buybox_element.text.replace("$", "")  # Remove the "$" symbol
            except Exception as e:
                print("An error occurred:", e)
            try:
                url_element = element.find_element(By.CSS_SELECTOR, 'a.a-link-normal')
                if url_element is None: continue
                url = url_element.get_attribute("href")
            except Exception as e:
                print("An error occurred:", e)
            print(asin)
            add_to_db(asin, buybox, url)

            scanned_asins.add(asin)
        return elements

    except Exception as e:
        print("An error occurred:", e)



def add_to_db(asin, buybox, url):
    print('adding to db')

    existing_product = amzn_product_data.find_one({"$or": [{"ASIN": asin}, {"URL": url}]})

    if existing_product:
        print("Duplicate found:", asin)
        return  # Exit the function if a duplicate is found

    # Create a dictionary to hold the data
    product_data = {
        "ASIN": asin,
        "Buy Box": buybox,
        "URL": url
    }

    # Insert the data into the MongoDB collection
    amzn_product_data.insert_one(product_data)

    print("Data added to the database.", asin)
    print(amzn_product_data.count_documents({}), "products added.")

root = tk.Tk()
root.title("Amazon Manual Data Input")
root.geometry("150x75") 

scan_btn = tk.Button(root, text="Scan", width=20, command=scan_elements)
scan_btn.pack()  # Adds some vertical padding around the button


root.mainloop()

