#!/usr/bin/env python3
"""
Split side-by-side SVG clothing templates into front/back views.
Handles: polygon, path, line, polyline, rect, circle, ellipse
"""

import re
import xml.etree.ElementTree as ET
from pathlib import Path
from copy import deepcopy

ET.register_namespace('', 'http://www.w3.org/2000/svg')

def extract_first_x(element):
    """Extract the first x-coordinate from an SVG element (most reliable for side detection)."""
    tag = element.tag.split('}')[-1]  # Remove namespace
    
    if tag in ('polygon', 'polyline'):
        points = element.get('points', '')
        nums = re.findall(r'-?(?:\d+\.?\d*|\.\d+)', points)
        return float(nums[0]) if nums else None
        
    elif tag == 'path':
        d = element.get('d', '')
        # Find first M/m command and get its x coordinate
        match = re.search(r'[Mm]\s*(-?(?:\d+\.?\d*|\.\d+))', d)
        if match:
            return float(match.group(1))
        # Fallback: first number in path
        nums = re.findall(r'-?(?:\d+\.?\d*|\.\d+)', d)
        return float(nums[0]) if nums else None
            
    elif tag == 'line':
        return float(element.get('x1', 0))
        
    elif tag == 'rect':
        return float(element.get('x', 0))
        
    elif tag in ('circle', 'ellipse'):
        return float(element.get('cx', 0))
        
    return None

def get_element_side(element, midpoint):
    """Determine if element belongs to left or right side."""
    first_x = extract_first_x(element)
    if first_x is None:
        return None
    return 'left' if first_x < midpoint else 'right'

def split_svg(input_path, output_dir=None):
    """Split a single SVG into front (left) and back (right) views."""
    tree = ET.parse(input_path)
    root = tree.getroot()
    
    # Parse viewBox
    viewbox = root.get('viewBox', '0 0 100 100')
    vb_parts = list(map(float, viewbox.split()))
    vb_x, vb_y, vb_width, vb_height = vb_parts
    midpoint = vb_x + vb_width / 2
    
    # Create two copies
    left_tree = deepcopy(root)
    right_tree = deepcopy(root)
    
    def filter_elements(parent, side):
        """Recursively filter elements by side."""
        to_remove = []
        for child in parent:
            child_tag = child.tag.split('}')[-1]
            
            # Skip defs, style, etc.
            if child_tag in ('defs', 'style', 'title', 'desc'):
                continue
                
            # If it's a group, recurse
            if child_tag == 'g':
                filter_elements(child, side)
                # Remove empty groups
                if len(child) == 0:
                    to_remove.append(child)
            else:
                element_side = get_element_side(child, midpoint)
                if element_side and element_side != side:
                    to_remove.append(child)
                    
        for elem in to_remove:
            parent.remove(elem)
    
    filter_elements(left_tree, 'left')
    filter_elements(right_tree, 'right')
    
    # Calculate actual content bounds
    def get_content_bounds(root_elem):
        """Get min/max x coordinates based on first x of each element."""
        x_values = []
        for elem in root_elem.iter():
            tag = elem.tag.split('}')[-1]
            if tag in ('defs', 'style', 'title', 'desc', 'g'):
                continue
            x = extract_first_x(elem)
            if x is not None:
                x_values.append(x)
                # For polygons/polylines, get actual extent
                if tag in ('polygon', 'polyline'):
                    points = elem.get('points', '')
                    nums = re.findall(r'-?(?:\d+\.?\d*|\.\d+)', points)
                    x_coords = [float(nums[i]) for i in range(0, len(nums), 2) if i < len(nums)]
                    if x_coords:
                        x_values.extend([min(x_coords), max(x_coords)])
                elif tag == 'line':
                    x_values.append(float(elem.get('x2', x)))
        return (min(x_values), max(x_values)) if x_values else (0, 100)
    
    # Get content bounds for each side
    left_min_x, left_max_x = get_content_bounds(left_tree)
    right_min_x, right_max_x = get_content_bounds(right_tree)
    
    # Use consistent width for both (half of original), centered on content
    half_width = vb_width / 2
    padding = 5
    
    # Center left content
    left_content_center = (left_min_x + left_max_x) / 2
    left_vb_x = left_content_center - half_width / 2
    left_vb = f"{left_vb_x} {vb_y} {half_width} {vb_height}"
    left_tree.set('viewBox', left_vb)
    
    # Center right content  
    right_content_center = (right_min_x + right_max_x) / 2
    right_vb_x = right_content_center - half_width / 2
    right_vb = f"{right_vb_x} {vb_y} {half_width} {vb_height}"
    right_tree.set('viewBox', right_vb)
    
    # Update width attribute if present
    if root.get('width'):
        left_tree.set('width', str(float(root.get('width').replace('px','')) / 2))
        right_tree.set('width', str(float(root.get('width').replace('px','')) / 2))
    
    # Output paths
    input_path = Path(input_path)
    output_dir = Path(output_dir) if output_dir else input_path.parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    stem = input_path.stem
    left_path = output_dir / f"{stem}_front.svg"
    right_path = output_dir / f"{stem}_back.svg"
    
    ET.ElementTree(left_tree).write(left_path, xml_declaration=True, encoding='unicode')
    ET.ElementTree(right_tree).write(right_path, xml_declaration=True, encoding='unicode')
    
    print(f"✓ {input_path.name} → {left_path.name}, {right_path.name}")
    return left_path, right_path

def batch_split(input_dir, output_dir=None):
    """Process all SVGs in a directory."""
    input_dir = Path(input_dir)
    svgs = list(input_dir.glob('*.svg'))
    print(f"Found {len(svgs)} SVG files\n")
    
    for svg in svgs:
        try:
            split_svg(svg, output_dir)
        except Exception as e:
            print(f"✗ {svg.name}: {e}")

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print("Usage: python split_svg.py <input_dir> [output_dir]")
        print("   or: python split_svg.py <single_file.svg> [output_dir]")
        sys.exit(1)
    
    input_path = Path(sys.argv[1])
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    if input_path.is_dir():
        batch_split(input_path, output_dir)
    else:
        split_svg(input_path, output_dir)