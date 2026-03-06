from PIL import Image
import os
import sys

def remove_background(img_path, threshold=230, is_dark=False):
    # Open image
    try:
        img = Image.open(img_path)
    except FileNotFoundError:
        print(f"File not found: {img_path}")
        return

    img = img.convert("RGBA")
    datas = img.getdata()
    newData = []
    
    # We define what color is the "background"
    # For light logo, background is dark (nearly black)
    # For dark logo, background is light (nearly white)
    
    for item in datas:
        # item is (R, G, B, A)
        if is_dark:
            # Dark logo usually has a dark background (almost black)
            # Remove pixels that are very close to black
            if item[0] < threshold and item[1] < threshold and item[2] < threshold:
                newData.append((255, 255, 255, 0)) # transparent
            else:
                newData.append(item)
        else:
            # Light logo usually has a light background (almost white)
            # Remove pixels that are very close to white
            if item[0] > threshold and item[1] > threshold and item[2] > threshold:
                newData.append((255, 255, 255, 0)) # transparent
            else:
                newData.append(item)
    
    img.putdata(newData)
    
    # Save the output image directly over the original (or as a new file if preferred)
    img.save(img_path, "PNG")
    print(f"Processed: {img_path}")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(base_dir, "src", "assets")
    
    # logo-dark has a dark background in UI, meaning the logo ITSELF is dark text on a light background.
    logo_dark_path = os.path.join(assets_dir, "logo-dark.png")
    # logo-light has light text, meaning it's on a dark background.
    logo_light_path = os.path.join(assets_dir, "logo-light.png")

    # Assuming logo-dark.png has a WHITE background (R>240, G>240, B>240)
    print("Processing logo-dark.png...")
    remove_background(logo_dark_path, threshold=240, is_dark=False)

    # Assuming logo-light.png has a BLACK/DARK background (R<15, G<15, B<15)
    print("Processing logo-light.png...")
    remove_background(logo_light_path, threshold=15, is_dark=True)

if __name__ == "__main__":
    main()
