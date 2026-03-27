"""
Prepare training dataset from raw email CSV files.

Combines multiple email datasets into a single CSV with:
  - text: combined email content (subject + body)
  - label: 0 = legitimate, 1 = phishing/spam
"""

import os
import pandas as pd
import sys

# Dataset directory with raw CSVs
DATASET_DIR = r'D:\Study\BTech\CapStone\Project\DataSet\8339691'

# Dataset labels (file pattern -> label mapping)
# Spam/Phishing datasets
SPAM_LABELS = {
    'Nazario': 1,                    # phishing
    'Nazario_5': 1,                  # phishing
    'Nigerian_5': 1,                 # phishing/fraud
    'Nigerian_Fraud': 1,             # fraud
    'SpamAssasin': 1,                # spam
    'CEAS_08': 1,                    # spam
}

# Legitimate email datasets
LEGIT_LABELS = {
    'Enron': 0,                      # legitimate
    'Ling': 0,                       # legitimate
    'TREC_05': 0,                    # legitimate (TREC is mostly legit)
    'TREC_06': 0,                    # legitimate
    'TREC_07': 0,                    # legitimate
}

def load_and_label_dataset(filepath, label):
    """Load CSV and assign label"""
    try:
        df = pd.read_csv(filepath)
        
        # Combine text fields from emails
        text_parts = []
        
        # Add subject if exists
        if 'subject' in df.columns:
            text_parts.append(df['subject'].fillna(''))
        
        # Add body if exists
        if 'body' in df.columns:
            text_parts.append(df['body'].fillna(''))
        
        # Combine all text parts
        if text_parts:
            df['text'] = text_parts[0]
            for part in text_parts[1:]:
                df['text'] = df['text'] + ' ' + part
        else:
            print(f"Warning: {filepath} has no text fields")
            return None
        
        # Keep only text and label
        result = df[['text', 'label', ]]
        
        #  Override with our label mapping
        result['label'] = label
        
        print(f"Loaded {filepath}: {len(result)} samples, label={label}")
        return result
        
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return None


def main():
    os.chdir(DATASET_DIR)
    all_dfs = []
    
    # Load spam/phishing datasets
    for name, label in SPAM_LABELS.items():
        filepath = f"{name}.csv"
        if os.path.exists(filepath):
            df = load_and_label_dataset(filepath, label)
            if df is not None:
                all_dfs.append(df)
    
    # Load legitimate datasets
    for name, label in LEGIT_LABELS.items():
        filepath = f"{name}.csv"
        if os.path.exists(filepath):
            df = load_and_label_dataset(filepath, label)
            if df is not None:
                all_dfs.append(df)
    
    # Combine
    if not all_dfs:
        print("No datasets loaded!")
        sys.exit(1)
    
    combined = pd.concat(all_dfs, ignore_index=True)
    print(f"\n--- Combined Dataset ---")
    print(f"Total samples: {len(combined)}")
    print(f"Class distribution: {combined['label'].value_counts().to_dict()}")
    
    # Save
    output_file = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'phishing_raw_dataset.csv'
    )
    combined.to_csv(output_file, index=False)
    print(f"\nSaved to: {output_file}")
    print(f"Columns: {combined.columns.tolist()}")


if __name__ == '__main__':
    main()
