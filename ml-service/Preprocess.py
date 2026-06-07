import os
import glob
import pandas as pd
import numpy as np

# Define paths relative to your structure
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "clean-data")

# Dynamically find your Windows Desktop path for the raw files
DESKTOP_DIR = os.path.join(os.environ['USERPROFILE'], 'Desktop')
RAW_DATA_DIR = os.path.join(DESKTOP_DIR, "Raw-Data")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Define target counties exactly as they might appear in the text strings
TARGET_COUNTIES = ["machakos", "kitui", "makueni"]

def process_crop_folder(crop_name, folder_name):
    """
    Crawls a folder of .xls files on the Desktop, extracts relevant rows, 
    normalizes price weights, and handles chronological resampling to eliminate data gaps.
    """
    search_path = os.path.join(RAW_DATA_DIR, folder_name, "*.xls")
    excel_files = glob.glob(search_path)
    
    if not excel_files:
        print(f"⚠️ No .xls files found in the {folder_name} folder on your Desktop. Check folder location.")
        return
    
    all_rows = []
    
    print(f"Processing {len(excel_files)} files found for {crop_name}...")
    
    for file_path in excel_files:
        try:
            # Read excel sheet (using xlrd backend for older .xls formats)
            df = pd.read_excel(file_path, engine='openpyxl')
            
            # Standardize column names to lowercase to strip out human entry mismatches
            df.columns = [str(col).strip().lower() for col in df.columns]
            
            # Check for core columns matching KAMIS specifications
            required = ['county', 'date']
            if not all(col in df.columns for col in required):
                print(f"Skipping file due to layout mismatch: {os.path.basename(file_path)}")
                continue
                
            all_rows.append(df)
        except Exception as e:
            print(f"Error reading file {os.path.basename(file_path)}: {e}")
            
    if not all_rows:
        return
        
    # Combine all individual Excel files into one massive master dataframe
    master_df = pd.concat(all_rows, ignore_index=True)
    
    # 1. Cleaning & Filtering
    master_df['county'] = master_df['county'].astype(str).str.strip().str.lower()
    master_df = master_df[master_df['county'].isin(TARGET_COUNTIES)]
    
    # Convert date column safely to datetime objects
    master_df['date'] = pd.to_datetime(master_df['date'], errors='coerce')
    master_df = master_df.dropna(subset=['date'])
    
    # 2. Price Normalization Loop
    # We prioritize Wholesale price but fall back to Retail if wholesale is blank
    if 'wholesale' in master_df.columns:
        master_df['price_clean'] = pd.to_numeric(master_df['wholesale'].astype(str).str.replace('/Kg', '', regex=False), errors='coerce')
    else:
        master_df['price_clean'] = pd.to_numeric(master_df['retail'].astype(str).str.replace('/Kg', '', regex=False), errors='coerce')
        
    # Handle missing price entries from daily reporting lags
    master_df = master_df.dropna(subset=['price_clean'])
    
    # CRITICAL conversion step: convert per-Kg prices to standard Kenyan 90Kg bags
    master_df['price_per_90kg'] = master_df['price_clean'] * 90
    
    # 3. Time Series Resampling by County
    for county in TARGET_COUNTIES:
        county_df = master_df[master_df['county'] == county].copy()
        if county_df.empty:
            print(f"ℹ️ No data rows found specifically for {county} county in the {crop_name} sheets.")
            continue
            
        # Set date as index for advanced time-series resampling manipulations
        county_df.set_index('date', inplace=True)
        
        # Resample from erratic daily rows to stable, continuous monthly mean blocks
        # 'ME' groups everything by month-end
        monthly_df = county_df[['price_per_90kg']].resample('ME').mean()
        
        # Bridge complete monthly reporting lags smoothly using linear interpolation
        monthly_df['price_per_90kg'] = monthly_df['price_per_90kg'].interpolate(method='linear')
        
        # 4. Inject Crop Calendar Feature Columns for LSTM Seasonality Tracking
        # January-February (Short Harvest) and June-August (Long Harvest) = 1, otherwise 0
        monthly_df['is_harvest_season'] = 0
        monthly_df.index = pd.to_datetime(monthly_df.index)
        harvest_months = [1, 2, 6, 7, 8]
        monthly_df.loc[monthly_df.index.month.isin(harvest_months), 'is_harvest_season'] = 1
        
        # Save isolated county CSV files for individual model training sets
        output_file = os.path.join(OUTPUT_DIR, f"{crop_name}_{county}_monthly.csv")
        monthly_df.to_csv(output_file)
        print(f"💾 Clean historical dataset saved successfully for {crop_name} in {county} county!")

# Execute processing pipelines for both folders on your Desktop
process_crop_folder("maize", "Maize")
process_crop_folder("ndengu", "Ndengu")
print("\n🎉 Preprocessing pipeline finished completely. Check your new 'clean-data' folder!")