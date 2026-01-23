import pandas as pd
import numpy as np
import os

def clean_country_name(name):
    """Removes whitespace and standardizes country names."""
    return str(name).strip()

# --- FIX: Automatically find the folder where this script is located ---
script_dir = os.path.dirname(os.path.abspath(__file__))
print(f"Script is running from: {script_dir}")
print("Looking for CSV files in that folder...")

# Load the datasets
file_names = {
    "eco": "Global Economy Indicators.csv",
    "col": "cost-of-living_v2.csv",  # Using v2 as it appears more complete
    "sol0": "standard-of-living-by-country-2025.csv",
    "sol1": "standard-of-living-by-country-2025 (1).csv",
    "sol2": "standard-of-living-by-country-2025 (2).csv",
    "sol3": "standard-of-living-by-country-2025 (3).csv",
    "sol4": "standard-of-living-by-country-2025 (4).csv",
    "sol5": "standard-of-living-by-country-2025 (5).csv",
    "sol6": "standard-of-living-by-country-2025 (6).csv",
    "wdi": "WB_WDI.csv"
}

dfs = {}
missing_files = []

for key, name in file_names.items():
    # create the full path: script_folder + filename
    full_path = os.path.join(script_dir, name)
    
    if os.path.exists(full_path):
        try:
            dfs[key] = pd.read_csv(full_path)
            # Clean column names
            dfs[key].columns = dfs[key].columns.str.strip()
            print(f"✓ Loaded: {name}")
        except Exception as e:
            print(f"X Error reading {name}: {e}")
            missing_files.append(name)
    else:
        print(f"X File not found: {name}")
        missing_files.append(name)

# Stop if critical files are missing
if "eco" not in dfs:
    print("\nCRITICAL ERROR: Could not find the main 'Global Economy' file.")
    print(f"Please ensure '{file_names['eco']}' is in: {script_dir}")
    exit()

# ==========================================
# PART 1: PREPARE GLOBAL ECONOMY (BASE)
# ==========================================
df_eco = dfs["eco"].copy()
df_eco = df_eco.rename(columns={'Country': 'Country', 'Year': 'Year'})
df_eco['Country'] = df_eco['Country'].apply(clean_country_name)

# ==========================================
# PART 2: PREPARE STANDARD OF LIVING (SOL)
# ==========================================
sol_frames = []

# Process File 1 (2024 Data + 2022 Rank)
if "sol1" in dfs:
    df_sol1 = dfs["sol1"].copy()
    df_sol1['country'] = df_sol1['country'].apply(clean_country_name)
    
    cols_2024 = ['country', 'QualityofLifeScoreNumbeo_2024', 'QualityofLifeScoreCEOWorld_2024']
    if set(cols_2024).issubset(df_sol1.columns):
        temp = df_sol1[cols_2024].copy()
        temp.columns = ['Country', 'QualityofLifeScoreNumbeo', 'QualityofLifeScoreCEOWorld']
        temp['Year'] = 2024
        sol_frames.append(temp)

    if 'QualityofLifeRankUSNews_2022' in df_sol1.columns:
        temp = df_sol1[['country', 'QualityofLifeRankUSNews_2022']].copy()
        temp.columns = ['Country', 'QualityofLifeRankUSNews']
        temp['Year'] = 2022
        temp = temp.dropna()
        sol_frames.append(temp)

# Process File 2 (2023 Data)
if "sol2" in dfs:
    df_sol2 = dfs["sol2"].copy()
    df_sol2['country'] = df_sol2['country'].apply(clean_country_name)
    
    cols_2023 = ['country', 'QualityofLifeScoreNumbeo_2023', 'QualityofLifeScoreUSNews_2023', 'HumanDevelopmentIndex_2023']
    if set(cols_2023).issubset(df_sol2.columns):
        temp = df_sol2[cols_2023].copy()
        temp.columns = ['Country', 'QualityofLifeScoreNumbeo', 'QualityofLifeScoreUSNews', 'HumanDevelopmentIndex']
        temp['Year'] = 2023
        sol_frames.append(temp)

# Process File 3 (2022 HDI)
if "sol3" in dfs:
    df_sol3 = dfs["sol3"].copy()
    df_sol3['country'] = df_sol3['country'].apply(clean_country_name)
    
    cols_2022 = ['country', 'HumanDevelopmentIndex_2022']
    if set(cols_2022).issubset(df_sol3.columns):
        temp = df_sol3[cols_2022].copy()
        temp.columns = ['Country', 'HumanDevelopmentIndex']
        temp['Year'] = 2022
        sol_frames.append(temp)

if sol_frames:
    df_sol_combined = pd.concat(sol_frames, ignore_index=True)
    df_sol_final = df_sol_combined.groupby(['Country', 'Year'], as_index=False).first()
else:
    df_sol_final = pd.DataFrame(columns=['Country', 'Year'])

# ==========================================
# PART 3: PREPARE COST OF LIVING (COL)
# ==========================================
if "col" in dfs:
    df_col = dfs["col"].copy()
    df_col['country'] = df_col['country'].apply(clean_country_name)
    
    x_cols = [c for c in df_col.columns if c.startswith('x') and c[1:].isdigit()]
    df_col_agg = df_col.groupby('country')[x_cols].mean().reset_index()
    df_col_agg = df_col_agg.rename(columns={'country': 'Country'})
    df_col_agg['Year'] = 2024
else:
    df_col_agg = pd.DataFrame(columns=['Country', 'Year'])

# ==========================================
# PART 4: FINAL MERGE
# ==========================================
print("\nMerging datasets...")

df_merged = df_eco.merge(df_sol_final, on=['Country', 'Year'], how='outer')
df_merged = df_merged.merge(df_col_agg, on=['Country', 'Year'], how='outer')
df_merged = df_merged.sort_values(by=['Country', 'Year'])

# Save strictly to the same folder as the script
output_path = os.path.join(script_dir, "merged_project_data.csv")
df_merged.to_csv(output_path, index=False)

print(f"Success! File saved to: {output_path}")