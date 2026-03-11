from flask import Flask, jsonify

# 1. Веб-серверді баптау 
app = Flask(__name__)

# 2. Негізгі HTTP GET сұрауын өңдеу [cite: 42]
@app.route('/', methods=['GET'])
def home():
    # 3. JSON қайтаратын алғашқы эндпоинт 
    return jsonify({
        "status": "success",
        "message": "UniLib сервері іске қосылды!",
        "project": "Университет кітапханасы"
    })

# Серверді іске қосу 
if __name__ == '__main__':
    # debug=True режимі код өзгергенде серверді автоматты түрде қайта қосады
    app.run(debug=True, port=5000)