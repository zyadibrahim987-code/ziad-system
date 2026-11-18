# Builds ../app.js from core.js + _parts.json + app_tail.js. Run from src/.
import json, os
here = os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
p = json.load(open('_parts.json'))
js = "\n".join([p['helpers'], p['agg'], p['isdue'], p['reptext'], p['links'], p['dash1'], p['matrix'], p['dash2']]) + "\n" + open('core.js').read()
open('../app.js', 'w').write(js + open('app_tail.js').read())
print("built", len(js))
