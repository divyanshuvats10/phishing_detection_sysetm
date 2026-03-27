"""Quick diagnostic to understand the vectorized dataset format"""
import os

csvdir = r"d:\Study\BTech\CapStone\Project\DataSet\25432108\Vectorized"
fname = "Assassin_vectorized_data.csv"
fpath = os.path.join(csvdir, fname)

print(f"Checking: {fname}\n")

samples_by_row = {}
with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
    header = f.readline()
    print(f"Header: {header.strip()}\n")
    
    for i, line in enumerate(f):
        if i > 5000:  # Check first 5k lines
            break
        
        line = line.strip()
        if '(' in line:
            try:
                # Parse (row, col)
                start = line.find('(')
                end = line.find(')')
                row_col = line[start+1:end].split(',')
                row_idx = int(row_col[0])
                
                if row_idx not in samples_by_row:
                    samples_by_row[row_idx] = 0
                samples_by_row[row_idx] += 1
            except:
                pass

print("Sample row indices and feature counts (first 5k lines):")
for row in sorted(samples_by_row.keys())[:20]:
    print(f"  Row {row}: {samples_by_row[row]} features")

print(f"\nMax row index found: {max(samples_by_row.keys()) if samples_by_row else 'N/A'}")
print(f"Estimated number of samples: ~{max(samples_by_row.keys()) + 1 if samples_by_row else 'N/A'}")
