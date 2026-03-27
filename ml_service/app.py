import pkgutil
import importlib.util

# Compatibility shim: Python versions without pkgutil.get_loader
if not hasattr(pkgutil, 'get_loader'):
    def _compat_get_loader(name):
        try:
            spec = importlib.util.find_spec(name)
            if spec is None:
                return None
            class _Loader:
                def get_filename(self, fullname):
                    return spec.origin
            return _Loader()
        except Exception:
            return None

    pkgutil.get_loader = _compat_get_loader

from flask import Flask, request, jsonify
try:
    # When running as a package (recommended): python -m ml_service.app
    from .analysis import simple_analyze
except (ImportError, SystemError):
    # Fallback when running `python app.py` directly from the ml_service folder
    from analysis import simple_analyze

app = Flask(__name__)


@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json(force=True) or {}
    input_type = data.get('inputType')
    raw = data.get('raw', '')
    result = simple_analyze(input_type, raw)
    return jsonify(result)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000, debug=True)
