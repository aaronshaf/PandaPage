import re

# Read dml-fonts.ts
with open('dml-fonts.ts', 'r') as f:
    content = f.read()

# Find where the color types start (CT_ScRgbColor)
color_start = content.find('// Color choice types')
if color_start == -1:
    color_start = content.find('export interface CT_ScRgbColor')

# Find where EG_ColorChoice ends
eg_color_end = content.find('export type EG_ColorChoice')
if eg_color_end \!= -1:
    # Find the end of EG_ColorChoice definition
    lines = content[eg_color_end:].split('\n')
    for i, line in enumerate(lines):
        if line.strip().endswith(';'):
            eg_color_end = eg_color_end + len('\n'.join(lines[:i+1]))
            break

# Remove the color types section
if color_start \!= -1 and eg_color_end \!= -1:
    # Keep everything before color types
    new_content = content[:color_start]
    # Add everything after EG_ColorChoice
    remaining = content[eg_color_end+1:].lstrip('\n')
    new_content += remaining
    
    # Write back
    with open('dml-fonts.ts', 'w') as f:
        f.write(new_content)
    print("Removed color types from dml-fonts.ts")
else:
    print("Could not find color types section")
