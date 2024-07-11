import tensorflow as tf
import numpy as np
import cv2
from flask import Flask, request, jsonify
import json
from base64 import b64decode
from flask_cors import CORS, cross_origin
from PIL import Image
import wolframalpha

model = tf.keras.models.load_model('model.h5')
print("MODEL LOADED")
class_names = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'add', 'dec', 'div', 'eq', 'mul', 'sub', 'x', 'y', 'z']

def detect(count):
    result = []
    imgs = []
    for i in range(count):
        img = cv2.imread(str(i) + '.png', 0)
        img = cv2.resize(img, (100, 100))  # resize the image to the input shape of your model
        img = img / 255.0  # normalize the pixel values between 0 and 1
        imgs.append(img)
    imgs = np.array(imgs)
    predictions = model.predict(imgs)
    for pred in predictions:
        result.append(class_names[np.argmax(pred)])
    return result


def translate(res):
    translated = ''
    code = {'add': '+', 'dec': '.', 'div': '/', 'eq': '=', 'mul': '*', 'sub': '-'}
    for char in res:
        if char in code:
            translated += code[char]
        else:
            translated += char
    return translated

app_id = "VTKLPY-R5EQ5V6VAW"
client = wolframalpha.Client(app_id)

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/solve', methods=['POST', 'GET'])
@cross_origin()
def login():
    if request.method == 'POST':

        data = json.loads(str(request.data)[2:-1])
        print(data)
        count = data['count']
        images = data['images']
        for i in range(count):
            image = images[i].replace('data:image/png;base64,', '')
            text = image.encode('ascii')
            f = b64decode(text)
            with open(str(i) + '-temp.png', 'wb') as file:
                file.write(f)

            image = Image.open(str(i) + '-temp.png')
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[3])
            background.save(str(i) + '.png')
        detected = detect(count)
        translated = translate(detected)
        print(detected, translated)
        res = client.query(translated)
        print(res)
        answer = next(res.results).text

        return jsonify({'answer': answer, 'detected': translated})
    else:
        return jsonify({'error': "only post requests allowed"})


app.run(host = '0.0.0.0', port = 8000)



