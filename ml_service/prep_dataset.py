"""
Simplified data prep for pre-vectorized sparse format

Since these are academic spam/phishing datasets (Assassin, TREC, Enron, etc),
we'll load all and assign labels based on known dataset characteristics.
"""
import os
import pandas as pd
import numpy as np
from scipy import sparse
import pickle

DATASET_LABELS = {
    'Assassin': (True, "spam dataset - likely mostly spam"),    # mostly spam
    'CEAS-08': (True, "CEAS spam competition"),
    'Enron': (False, "Enron emails - mixed"),                   # mixed
    'Ling': (False, "Linguistics emails - mostly legit"),       # mixed
    'TREC-05': (False, "TREC spam track"),
    'TREC-06': (False, "TREC spam track"),
    'TREC-07': (False, "TREC spam track"),
}


def load_vectorized_csv(filepath):
    """
    Load sparse matrix format CSV into dense numpy array
    """
    print(f"Loading: {os.path.basename(filepath)}")
    
    row_data = {}  # row_idx -> {col_idx: value}
    max_col = 0
    
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        f.readline()  # skip "0,label" header
        
        for line in f:
            line = line.strip()
            if not line or '(' not in line:
                continue
            
            try:
                # Parse "  (row_idx, col_idx)    value"
                start = line.find('(')
                end = line.find(')')
                row_col = line[start+1:end].strip().split(',')
                row_idx = int(row_col[0].strip())
                col_idx = int(row_col[1].strip())
                
                # Parse value (everything after closing paren)
                val_str = line[end+1:].strip().split()[0]
                value = float(val_str)
                
                if row_idx not in row_data:
                    row_data[row_idx] = {}
                row_data[row_idx][col_idx] = value
                max_col = max(max_col, col_idx)
            
            except Exception as e:
                continue
    
    if not row_data:
        return None
    
    # Convert to dense
    n_rows = max(row_data.keys()) + 1
    n_cols = max_col + 1
    X = np.zeros((n_rows, n_cols), dtype=np.float32)
    
    for row_idx, cols_dict in row_data.items():
        for col_idx, value in cols_dict.items():
            X[row_idx, col_idx] = value
    
    sparsity = 1 - (np.count_nonzero(X) / X.size)
    print(f"  Shape: {X.shape}, Sparsity: {sparsity:.3f}")
    
    return X


def combine_and_prepare(input_dir, output_csv):
    """
    Load all vectorized CSVs, combine with inferred labels, save as trainable CSV
    """
    csv_files = sorted([f for f in os.listdir(input_dir) if 'vectorized' in f and f.endswith('.csv')])
    
    print(f"Found {len(csv_files)} datasets\n")
    
    all_data = []
    all_labels = []
    
    for fname in csv_files:
        filepath = os.path.join(input_dir, fname)
        X = load_vectorized_csv(filepath)
        
        if X is not None:
            # Infer label from dataset name
            label_is_phishing = False
            for dataset_name, (is_phishing, desc) in DATASET_LABELS.items():
                if dataset_name in fname:
                    label_is_phishing = is_phishing
                    print(f"  --> Assigning label={int(is_phishing)} ({desc})")
                    break
            
            all_data.append(X)
            all_labels.append(np.full(X.shape[0], label_is_phishing, dtype=int))
    
    if not all_data:
        print("No data loaded!")
        return
    
    # Align features across datasets
    max_features = max(d.shape[1] for d in all_data)
    aligned_data = []
    for d in all_data:
        if d.shape[1] < max_features:
            # Pad with zeros
            pad = np.zeros((d.shape[0], max_features - d.shape[1]), dtype=np.float32)
            d = np.hstack([d, pad])
        aligned_data.append(d)
    
    X_combined = np.vstack(aligned_data)
    y_combined = np.concatenate(all_labels)
    
    print(f"\n=== Combined Dataset ===")
    print(f"Shape: {X_combined.shape}")
    print(f"Class distribution:\n  Legitimate (0): {np.sum(y_combined == 0)}\n  Phishing (1): {np.sum(y_combined == 1)}")
    
    # Save as CSV
    print(f"\nSaving to {output_csv}...")
    feature_cols = [f"f{i}" for i in range(X_combined.shape[1])]
    df = pd.DataFrame(X_combined, columns=feature_cols)
    df['label'] = y_combined.astype(int)
    
    df.to_csv(output_csv, index=False)
    print(f"Saved: {output_csv}")
    print(f"Columns: {list(df.columns[:5])} ... label")
    
    return output_csv


if __name__ == '__main__':
    input_dir = r"d:\Study\BTech\CapStone\Project\DataSet\25432108\Vectorized"
    output_csv = "phishing_combined_dataset.csv"
    
    combine_and_prepare(input_dir, output_csv)
    print(f"\nNext: python train.py --data {output_csv}")
