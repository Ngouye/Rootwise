package sn.cryptoplatform.demo;

import java.io.ByteArrayOutputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;

/**
 * PDF d'une page, texte seul (Helvetica, encodage WinAnsi pour les accents), écrit à la main :
 * suffisant pour une fiche mémo de démonstration, sans dépendance supplémentaire.
 */
final class SimplePdf {

	private static final Charset WIN_ANSI = Charset.forName("windows-1252");
	private static final int WRAP = 88;

	private SimplePdf() {
	}

	static byte[] page(String title, List<String> paragraphs) {
		StringBuilder content = new StringBuilder();
		content.append("BT /F2 18 Tf 56 780 Td (").append(escape(title)).append(") Tj ET\n");
		int y = 745;
		for (String paragraph : paragraphs) {
			for (String line : wrap(paragraph)) {
				content.append("BT /F1 11 Tf 56 ").append(y).append(" Td (").append(escape(line)).append(") Tj ET\n");
				y -= 16;
			}
			y -= 6;
		}
		byte[] stream = content.toString().getBytes(WIN_ANSI);

		List<byte[]> objects = List.of(
				ascii("<< /Type /Catalog /Pages 2 0 R >>"),
				ascii("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
				ascii("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
						+ "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>"),
				ascii("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"),
				ascii("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"),
				concat(ascii("<< /Length " + stream.length + " >>\nstream\n"), stream, ascii("\nendstream")));

		ByteArrayOutputStream pdf = new ByteArrayOutputStream();
		write(pdf, ascii("%PDF-1.4\n"));
		List<Integer> offsets = new ArrayList<>();
		for (int i = 0; i < objects.size(); i++) {
			offsets.add(pdf.size());
			write(pdf, ascii((i + 1) + " 0 obj\n"));
			write(pdf, objects.get(i));
			write(pdf, ascii("\nendobj\n"));
		}
		int xref = pdf.size();
		StringBuilder table = new StringBuilder("xref\n0 " + (objects.size() + 1) + "\n0000000000 65535 f \n");
		offsets.forEach(offset -> table.append(String.format("%010d 00000 n \n", offset)));
		table.append("trailer\n<< /Size ").append(objects.size() + 1).append(" /Root 1 0 R >>\nstartxref\n")
				.append(xref).append("\n%%EOF\n");
		write(pdf, ascii(table.toString()));
		return pdf.toByteArray();
	}

	private static List<String> wrap(String text) {
		List<String> lines = new ArrayList<>();
		StringBuilder line = new StringBuilder();
		for (String word : text.split(" ")) {
			if (line.length() > 0 && line.length() + 1 + word.length() > WRAP) {
				lines.add(line.toString());
				line.setLength(0);
			}
			if (line.length() > 0) {
				line.append(' ');
			}
			line.append(word);
		}
		lines.add(line.toString());
		return lines;
	}

	private static String escape(String text) {
		return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
	}

	private static byte[] ascii(String text) {
		return text.getBytes(WIN_ANSI);
	}

	private static byte[] concat(byte[]... parts) {
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		for (byte[] part : parts) {
			write(out, part);
		}
		return out.toByteArray();
	}

	private static void write(ByteArrayOutputStream out, byte[] bytes) {
		out.write(bytes, 0, bytes.length);
	}
}
