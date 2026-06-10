import os
from flask import Flask, send_from_directory, jsonify

app = Flask(__name__, static_folder='static', static_url_path='')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_dir = app.static_folder
    if path and os.path.exists(os.path.join(static_dir, path)):
        return send_from_directory(static_dir, path)
    return send_from_directory(static_dir, 'index.html')

@app.route('/health')
def health():
    return jsonify(status='ok')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
