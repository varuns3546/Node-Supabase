import tkinter as tk
from tkinter import ttk
import os
import random
import string
from dotenv import load_dotenv
from pymongo import MongoClient
from fastapi import FastAPI

load_dotenv()

app = FastAPI()

MONGO_CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")

app.mongodb_client = MongoClient(MONGO_CONNECTION_STRING)

app.database = app.mongodb_client["productData"]

amzn_product_data = app.database["amazonProductData"]


# Create the main window
root = tk.Tk()
root.title("Amazon Manual Data Input")
root.geometry("300x130")  

notebook = ttk.Notebook(root)
notebook.pack(expand=True, fill="both")


shoes_clothes_jewelry = ttk.Frame(notebook)
tab2 = ttk.Frame(notebook)

notebook.add(shoes_clothes_jewelry, text="Shoes, Clothes, and Jewelry")
notebook.add(tab2, text="Tab 2")

font_style = ('Arial', 10)
asin_label = tk.Label(shoes_clothes_jewelry, text="ASIN:", width=15, font=font_style)
asin_entry = tk.Entry(shoes_clothes_jewelry , width=25, font=font_style)
buybox_label = tk.Label(shoes_clothes_jewelry, text="Buy Box:", width=15, font=font_style)
buybox_entry = tk.Entry(shoes_clothes_jewelry, width=25, font=font_style)
url_label = tk.Label(shoes_clothes_jewelry, text="URL:", width=15, font=font_style)
url_entry = tk.Entry(shoes_clothes_jewelry, width=25, font=font_style)
enter = tk.Button(shoes_clothes_jewelry, text="Enter", width=20, font=font_style)

asin_label.grid(row=0, column=0)
asin_entry.grid(row=0, column=1)
buybox_label.grid(row=1, column=0)
buybox_entry.grid(row=1, column=1)
url_label.grid(row=2, column=0)
url_entry.grid(row=2, column=1)
enter.grid(row=3, column=0, columnspan=2)

def add_to_db():
    # Retrieve the data from the entry fields
    asin = asin_entry.get()
    buybox = buybox_entry.get()
    url = url_entry.get()

    existing_product = amzn_product_data.find_one({"$or": [{"ASIN": asin}, {"URL": url}]})

    if existing_product:
        print("Duplicate found:", existing_product)
        return  # Exit the function if a duplicate is found

    # Create a dictionary to hold the data
    product_data = {
        "ASIN": asin,
        "Buy Box": buybox,
        "URL": url
    }

    # Insert the data into the MongoDB collection
    amzn_product_data.insert_one(product_data)

    # Optionally, clear the entry fields after insertion
    asin_entry.delete(0, tk.END)
    buybox_entry.delete(0, tk.END)
    url_entry.delete(0, tk.END)

    # Print a success message (optional)
    print("Data added. ASIN:", asin)
    print(amzn_product_data.count_documents({}), "products added.")

# Bind the add_to_db function to the Enter button
enter.config(command=add_to_db)


root.mainloop()


"""
scj_type = tk.StringVar()
scj_type.set("clothing")
scj_gender = tk.StringVar()
scj_gender.set("men")

clothing_radio = tk.Radiobutton(shoes_clothes_jewelry, text="Clothing", variable=scj_type, value="clothing")
shoes_radio = tk.Radiobutton(shoes_clothes_jewelry, text="Shoes", variable=scj_type, value="shoes")

men_radio = tk.Radiobutton(shoes_clothes_jewelry, text="Men", variable=scj_gender, value="men")
women_radio = tk.Radiobutton(shoes_clothes_jewelry, text="Women", variable=scj_gender, value="women")



clothing_radio.grid(row=0, column=0, sticky="w")
shoes_radio.grid(row=1, column=0, sticky="w")

men_radio.grid(row=0, column=1, sticky="w")
women_radio.grid(row=1, column=1, sticky="w")
"""

