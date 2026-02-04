import { generateEbook } from "../services/ebookService.js";

export async function generateEbookController(req, res) {
    const { BOOK, METADATA } = req.body;
    
    await generateEbook(BOOK, METADATA);

    return res.status(200).json({ message: "Ebook generation started.", path: "/downloadEbook" });
}