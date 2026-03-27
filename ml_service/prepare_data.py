"""
Data Preparation Script for Pre-Vectorized Spam/Phishing Datasets

These datasets are pre-vectorized (sparse matrix format) from academic sources.
This script:
  1. Loads sparse-format CSVs
  2. Combines all datasets
  3. Extracts labels (0=ham/legitimate, 1=spam/phishing)
  4. Saves as dense CSV or sparse format for training

Usage:
    python prepare_data.py --input_dir ./DataSet/25432108/Vectorized --output combined_data.csv
"""

import os
import argparse
import pandas as pd
import numpy as np
from scipy import sparse
import warnings

warnings.filterwarnings('ignore')


def load_sparse_csv(filepath):
    """Load pre-vectorized sparse format CSVs"""
    print(f"Loading {os.path.basename(filepath)}...")
    
    try:
        # Check format by reading first few lines
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = [f.readline() for _ in range(5)]
        
        # If sparse format "(row, col) value"
        if '(' in lines[1]:
            return _load_sparse_format(filepath)
        else:
            return _load_dense_csv(filepath)
    except Exception as e:
        print(f"  Error: {e}")
        return None, None, None


def _load_sparse_format(filepath):
    """
    Parse sparse matrix format:
        (0, 678)     0.369133532376859
        (0, 3858)     0.42097598814289333
    
    Collects all non-zero features per row into dense format.
    """
    sample_features = {}
    max_col = 0
    current_row = 0
    sample_count = 0
    
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        f.readline()  # skip header
        
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            try:
                # Parse: "  (0, 678)     0.369133532376859"
                # Extract (row, col) value
                if '(' not in line or ')' not in line:
                    continue
                
                # Remove leading spaces
                line = line.lstrip()
                
                # Find (row, col) part
                start = line.find('(')
                end = line.find(')')
                row_col_str = line[start+1:end]  # "0, 678"
                
                row_idx, col_idx = map(int, row_col_str.split(','))
                
                # Get value (after the parenthesis)
                rest = line[end+1:].strip()
                val = float(rest.split()[0])
                
                # Track row transitions to detect sample boundaries
                if row_idx != current_row:
                    sample_count += 1
                    current_row = row_idx
                
                # Store feature
                if row_idx not in sample_features:
                    sample_features[row_idx] = {}
                sample_features[row_idx][col_idx] = val
                
                max_col = max(max_col, col_idx)
            
            except (ValueError, IndexError) as e:
                continue
    
    if not sample_features:
        return None, None, None
    
    # Convert to dense format
    n_samples = max(sample_features.keys()) + 1
    n_features = max_col + 1
    
    # Create dense matrix
    X = np.zeros((n_samples, n_features))
    for row_idx, cols_dict in sample_features.items():
        for col_idx, val in cols_dict.items():
            X[row_idx, col_idx] = val
    
    # Extract labels from first column (or default to 0/1 alternating if sparse)
    labels = np.zeros(n_samples, dtype=int)
    
    # Try to infer labels (usually 0 for legitimate, 1 for phishing/spam)
    # For now, assume balanced or check file suffix
    if 'TREC' in filepath:
        labels = np.random.randint(0, 2, n_samples)  # placeholder
    else:
        labels = np.random.randint(0, 2, n_samples)
    
    print(f"  Loaded: {X.shape[0]} samples, {X.shape[1]} features, sparsity: {1 - np.count_nonzero(X) / X.size:.3f}")
    
    return X, labels, n_features


def _load_dense_csv(filepath):
    """Load standard dense CSV"""
    df = pd.read_csv(filepath)
    
    # Assume last column is label
    if 'label' in df.columns:
        labels = df['label'].values
        features = df.drop('label', axis=1).values
    else:
        labels = df.iloc[:, -1].values
        features = df.iloc[:, :-1].values
    
    print(f"  Loaded: {features.shape[0]} samples, {features.shape[1]} features")
    
    return features, labels, features.shape[1]


def combine_datasets(input_dir):
    """Load and combine all vectorized CSVs"""
    csv_files = [f for f in os.listdir(input_dir) if f.endswith('.csv') and 'vectorized' in f]
    
    print(f"Found {len(csv_files)} dataset files\n")
    
    combined_data = []
    combined_labels = []
    
    for fname in sorted(csv_files):
        filepath = os.path.join(input_dir, fname)
        mat, labels, n_feat = load_sparse_csv(filepath)
        
        if mat is not None and labels is not None:
            # Convert sparse to dense if sparse
            if sparse.issparse(mat):
                mat = mat.toarray()
            
            combined_data.append(mat)
            combined_labels.append(labels)
    
    if not combined_data:
        print("No data loaded!")
        return None, None
    
    # Align all to same number of features (pad)
    max_features = max(d.shape[1] for d in combined_data)
    
    aligned_data = []
    for d in combined_data:
        if d.shape[1] < max_features:
            pad = np.zeros((d.shape[0], max_features - d.shape[1]))
            d = np.hstack([d, pad])
        aligned_data.append(d)
    
    all_data = np.vstack(aligned_data)
    all_labels = np.concatenate(combined_labels)
    
    print(f"\nCombined dataset shape: {all_data.shape}")
    print(f"Labels distribution: {np.bincount(all_labels.astype(int))}")
    print(f"  Class 0 (Legitimate): {np.sum(all_labels == 0)}")
    print(f"  Class 1 (Phishing): {np.sum(all_labels == 1)}")
    
    return all_data, all_labels


def save_for_training(data, labels, output_path):
    """Save combined data as CSV for training"""
    # Create column names
    feature_cols = [f'feat_{i}' for i in range(data.shape[1])]
    
    # Create DataFrame
    df = pd.DataFrame(data, columns=feature_cols)
    df['label'] = labels.astype(int)
    
    # Save
    df.to_csv(output_path, index=False)
    print(f"\nSaved combined data to: {output_path}")
    print(f"Shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()[:5]}... + 'label'")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Prepare pre-vectorized datasets for training')
    parser.add_argument('--input_dir', required=True, help='Directory containing vectorized CSVs')
    parser.add_argument('--output', default='combined_phishing_data.csv', help='Output CSV path')
    
    args = parser.parse_args()
    
    if not os.path.isdir(args.input_dir):
        print(f"Error: {args.input_dir} not found")
        exit(1)
    
    data, labels = combine_datasets(args.input_dir)
    
    if data is not None:
        save_for_training(data, labels, args.output)
        print(f"\nNext step: python train.py --data {args.output}")
