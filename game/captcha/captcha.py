import math
from random import randrange
from PIL import Image, ImageDraw, ImageFont
from .params import *


def generate(words):
    bg_color = random_color()
    img = Image.new('RGBA', (400, len(words) * 45), bg_color)
    draw_applique(img)
    draw_text(img, words)
    draw_lines(img, bg_color)

    noise_img = get_noise(img.size)
    img.paste(noise_img, (0, 0), noise_img)
    return img


def draw_applique(img):
    draw = ImageDraw.Draw(img)

    for i in range(rand(FIGURES_COUNT)):
        figure = randrange(1, 3)
        if figure == 1:
            diameter = rand(CIRCLE_DIAMETER)
            x = randrange(-diameter // 2, img.size[0])
            y = randrange(-diameter // 2, img.size[1])
            coords = [(x, y), (x + diameter, y + diameter)]
            draw.ellipse(coords, fill=random_color())
        elif figure == 2:
            origin_x = randrange(0, img.size[0])
            origin_y = randrange(0, img.size[1])
            point1 = (origin_x, origin_y)
            point2 = (origin_x + rand(TRIANGLE_MAX_SPREAD), origin_y + rand(TRIANGLE_MAX_SPREAD))
            point3 = (origin_x + rand(TRIANGLE_MAX_SPREAD), origin_y + rand(TRIANGLE_MAX_SPREAD))
            draw.polygon([point1, point2, point3], fill=random_color())


def draw_text(img, words):
    draw = ImageDraw.Draw(img)
    x = rand(X_START)
    y = 0
    for word in words:
        for letter in list(word):
            font_size = rand(FONT_SIZE)
            letter_image = generate_letter_image(letter, font_size)
            img.paste(letter_image, (x, y), letter_image)
            x += rand(CHAR_SPACING)

        x = rand(X_START)
        y += rand(LINE_SPACING) + 35


def draw_lines(img, color):
    draw = ImageDraw.Draw(img)

    for i in range(0, 7):
        y1 = randrange(0, img.size[1])
        y2 = y1 + rand(LINE_Y_DIFF)
        coords = [(0, y1),
                  (img.size[0], y2)]
        draw.line(coords, fill=color, width=rand(LINE_WIDTH))


def get_noise(size):
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    alpha = rand(NOISE_ALPHA)
    for x in range(0, img.size[0]):
        for y in range(0, img.size[1]):
            brightness = randrange(0, 255)
            draw.point((x, y), fill=(brightness, brightness, brightness, alpha))
    return img


def generate_letter_image(letter, font_size):
    img_size = int(font_size * 1.5)
    img = Image.new('RGBA', (img_size, img_size), (0, 0, 0, 0))

    draw = ImageDraw.Draw(img)
    draw.text((img_size // 4, 0),
              letter,
              font=ImageFont.truetype(font='Arial.ttf', size=font_size),
              fill=random_color())

    return img.rotate(rand(LETTER_ANGLE), resample=Image.BICUBIC)


def rand(param):
    return randrange(param[0], param[1])


def random_color():
    r = randrange(0, 255)
    g = randrange(0, 255)
    b = randrange(0, 255)
    return r, g, b, 255


def to_radians(degrees):
    return degrees * math.pi / 180
