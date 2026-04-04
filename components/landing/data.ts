export const prices = [
  { label: "USD", value: "154,700", change: "+0.3%", city: "Erbil" },
  { label: "Gold 21K", value: "1,022,000", change: "+1.2%", city: "Baghdad" },
  { label: "EUR", value: "168,200", change: "-0.1%", city: "Sulaymaniyah" },
  { label: "GBP", value: "197,500", change: "+0.5%", city: "Duhok" },
  { label: "Gold 18K", value: "876,000", change: "+0.8%", city: "Kirkuk" },
  { label: "TRY", value: "4,320", change: "-0.2%", city: "Erbil" },
];

export const cities = ["Erbil", "Baghdad", "Sulaymaniyah", "Duhok", "Kirkuk"];

export const codeSnippets: Record<string, string> = {
  JavaScript: `const res = await fetch(
  "https://borsaapi.vercel.app/api/v2/get-price
  ?item=usd&location=erbil",
  {
    headers: {
      Authorization: "Bearer YOUR_TOKEN"
    }
  }
);
const { value, created_at } = await res.json();`,
  Python: `import requests

res = requests.get(
  "https://borsaapi.vercel.app/api/v2/get-price",
  params={"item": "usd", "location": "erbil"},
  headers={"Authorization": "Bearer YOUR_TOKEN"}
)
data = res.json()
print(data["value"], data["created_at"])`,
  Dart: `final res = await http.get(
  Uri.parse(
    'https://borsaapi.vercel.app/api/v2/get-price'
    '?item=usd&location=erbil'
  ),
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
);
final data = jsonDecode(res.body);`,
};
