#!/usr/bin/env python3

import json
import os

def separate_sectors_and_points(input_file, output_dir):
    """
    Separates the merged JSON data into two files:
    - sectors.json: Contains polygon data for map visualization
    - points.json: Contains point data with coordinates, decibels, audios, etc.
    """
    
    # Read the input JSON file
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Separate sectors (polygons) and points data
    sectors_data = {
        "distrito": data["distrito"],
        "ciudad": data["ciudad"],
        "pais": data["pais"],
        "timestamp": data["timestamp"],
        "total_sectores": data["total_sectores"],
        "estadisticas": data["estadisticas"],
        "metodo_extraccion": data["metodo_extraccion"],
        "sectores": []
    }
    
    points_data = {
        "distrito": data["distrito"],
        "ciudad": data["ciudad"],
        "pais": data["pais"],
        "timestamp": data["timestamp"],
        "total_puntos": data["total_sectores"],  # Same count as sectors
        "estadisticas": data["estadisticas"],
        "metodo_extraccion": data["metodo_extraccion"],
        "puntos": []
    }
    
    # Define colors for sectors (using a nice palette)
    sector_colors = [
        "#FF6B6B",  # Light red
        "#4ECDC4",  # Teal
        "#45B7D1",  # Light blue
        "#96CEB4",  # Light green
        "#FECA57",  # Yellow
        "#FF9FF3",  # Light pink
        "#54A0FF",  # Blue
        "#5F27CD",  # Purple
        "#00D2D3",  # Cyan
        "#FF9F43",  # Orange
        "#10AC84",  # Green
        "#EE5A24",  # Red-orange
        "#C44569",  # Pink
        "#A55EEA"   # Light purple
    ]
    
    # Process each sector
    for i, sector in enumerate(data["sectores"]):
        # Extract sector data (polygon information) with color
        sector_info = {
            "id": sector["id"],
            "name": sector["name"],
            "polygon": sector["polygon"],
            "sector_type": sector["sector_type"],
            "color": sector_colors[i % len(sector_colors)]  # Cycle through colors if more sectors than colors
        }
        
        # Extract point data (measurement information)
        point_info = {
            "id": sector["id"],
            "name": sector["name"],
            "lat": sector["lat"],
            "lon": sector["lon"],
            "decibeles": sector["decibeles"],
            "audios": sector["audios"],
            "timestamp": sector["timestamp"]
        }
        
        sectors_data["sectores"].append(sector_info)
        points_data["puntos"].append(point_info)
    
    # Write the separated files
    sectors_file = os.path.join(output_dir, 'barranco_sectors.json')
    points_file = os.path.join(output_dir, 'barranco_points.json')
    
    with open(sectors_file, 'w', encoding='utf-8') as f:
        json.dump(sectors_data, f, ensure_ascii=False, indent=2)
    
    with open(points_file, 'w', encoding='utf-8') as f:
        json.dump(points_data, f, ensure_ascii=False, indent=2)
    
    print(f"Data successfully separated:")
    print(f"- Sectors (polygons): {sectors_file}")
    print(f"- Points (measurements): {points_file}")
    print(f"- Total sectors: {len(sectors_data['sectores'])}")
    print(f"- Total points: {len(points_data['puntos'])}")

if __name__ == "__main__":
    input_file = "public/data/barranco_sectors_extracted.json"
    output_dir = "public/data"
    
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found!")
        exit(1)
    
    separate_sectors_and_points(input_file, output_dir)