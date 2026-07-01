import sys
from PIL import Image

def ascii_art(image_path, width=80):
    img = Image.open(image_path).convert('L')
    w, h = img.size
    aspect_ratio = h / w
    height = int(width * aspect_ratio * 0.5)
    img = img.resize((width, height))
    pixels = img.getdata()
    chars = ["@", "#", "S", "%", "?", "*", "+", ";", ":", ",", "."]
    new_pixels = [chars[pixel//25] for pixel in pixels]
    new_pixels = ''.join(new_pixels)
    ascii_image = [new_pixels[index:index + width] for index in range(0, len(new_pixels), width)]
    return "\n".join(ascii_image)

print(ascii_art("assets/images/Rectangle 10.png"))
