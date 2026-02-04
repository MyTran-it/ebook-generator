export async function generateEbook(BOOK, METADATA) {
  return await fetch("http://localhost:3000/api/generate-ebook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ BOOK, METADATA }),
  });
}

export async function downloadEbook() {
    console.log("yoyoyo")
    return await fetch("http://localhost:3000/api/download-ebook", {
        methos: "GET"
    })
}