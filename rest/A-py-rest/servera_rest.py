from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/count-words', methods=['POST'])
def count_words():
    data = request.get_json()
    text = data.get("text", "")
    word_count = len(text.strip().split())
    print(f'Texto recebido: "{text}" - Palavras: {word_count}')
    return jsonify({"word_count": word_count})

if __name__ == "__main__":
    print("Microserviço B (Contador de Palavras) rodando em http://0.0.0.0:6001 ...")
    app.run(host="0.0.0.0", port=6001)
