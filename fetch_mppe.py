import urllib.request

url = "https://raw.githubusercontent.com/torvalds/linux/master/drivers/net/ppp/ppp_mppe.c"
try:
    with urllib.request.urlopen(url) as response:
        html = response.read().decode('utf-8')
    with open("ppp_mppe.c", "w", encoding="utf-8") as f:
        f.write(html)
    print("SUCCESS")
except Exception as e:
    print("ERROR:", e)
