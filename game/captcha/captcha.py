import hashlib
import os
from random import choice
from PIL import Image
from .image import generate as generate_image
from .patterns import *


CAPTCHA_IMAGES_DIR = 'captcha_images'

PATTERNS = [
    max_length,
    min_length,
    max_letter_frequency
]


def generate(words):
    message, answer = get_task(words)
    captcha_id = get_captcha_id(words, message)
    answer_hash = hash_answer(answer)

    img = generate_image(words)
    if not os.path.exists(CAPTCHA_IMAGES_DIR):
        os.makedirs(CAPTCHA_IMAGES_DIR)

    img.save(os.path.join(CAPTCHA_IMAGES_DIR, '%s.png' % captcha_id), 'PNG')
    return captcha_id, answer_hash, message


def hash_answer(answer):
    hash_object = hashlib.sha256(answer.strip().lower().encode('utf-8'))
    return hash_object.hexdigest()


def get_captcha_id(words, message):
    hash_object = hashlib.sha1((words[0] + words[1] + words[2] + message).encode('utf-8'))
    return hash_object.hexdigest()


def get_captcha_image(captcha_id):
    path = os.path.join(CAPTCHA_IMAGES_DIR, '%s.png' % captcha_id)

    if not os.path.exists(path):
        return None

    return Image.open(path)


def get_task(words):
    message = ''
    answer = ''
    success = False

    while not success:
        pattern = choice(PATTERNS)
        message, answer, success = pattern(words)

    return message, answer


def delete_captcha_image(captcha_id):
    path = os.path.join(CAPTCHA_IMAGES_DIR, '%s.png' % captcha_id)
    if os.path.exists(path):
        os.remove(path)
