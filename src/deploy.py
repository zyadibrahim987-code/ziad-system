# Build, version, commit and push to GitHub Pages. Usage (from src/): python3 deploy.py "message"
import subprocess, time, json, re, sys, os
here = os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
subprocess.run(["python3", "build.py"], check=True)
v = time.strftime("%Y%m%d%H%M%S", time.gmtime())
html = open("index.html").read()
html = re.sub(r'<script>window.__APP_VERSION=[^<]*</script>\n?', '', html)
html = html.replace('<script src="app.js"></script>', f'<script>window.__APP_VERSION="{v}"</script>\n<script src="app.js?v={v}"></script>')
open("../index.html", "w").write(html)
json.dump({"v": v}, open("../version.json", "w"))
msg = (sys.argv[1] if len(sys.argv) > 1 else "Update") + "\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
g = ["git", "-C", "..", "-c", "user.name=Zyad Ibrahim", "-c", "user.email=zyadibrahim987@gmail.com"]
subprocess.run(g + ["add", "-A"], check=True)
subprocess.run(g + ["commit", "-qm", msg], check=True)
subprocess.run(g + ["pull", "-q", "--rebase", "origin", "main"], check=True)  # never overwrite work pushed from another chat
subprocess.run(g + ["push", "-q", "origin", "main"], check=True)
print("deployed", v)
