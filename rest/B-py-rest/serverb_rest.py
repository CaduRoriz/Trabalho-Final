from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/count-vowels', methods=['POST'])
def count_vowels():
    data = request.get_json()
    text = data.get("text", "")
    vowels = sum(c.lower() in "aeiouáéíóúàèìòùãõ" for c in text)
    print(f'Texto recebido: "{text}" - Vogais: {vowels}')
    return jsonify({"vowel_count": vowels})

if __name__ == "__main__":
    print("Microserviço B (REST) rodando em http://0.0.0.0:6002 ...")
    app.run(host="0.0.0.0", port=6002)