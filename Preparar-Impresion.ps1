param(
    [string]$WorkingFolder = (Get-Location).Path,
    [string]$Original = (Get-ChildItem -LiteralPath $WorkingFolder -File -Filter '*.png' | Select-Object -First 1).FullName
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.IO.Compression;
using System.Drawing;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;

public static class PreparacionCarta
{
    static string Number(double value) { return value.ToString("0.########", CultureInfo.InvariantCulture); }
    static void Write(Stream stream, string value)
    {
        byte[] bytes = Encoding.ASCII.GetBytes(value);
        stream.Write(bytes, 0, bytes.Length);
    }
    static byte[] Compress(byte[] pixels)
    {
        using (var result = new MemoryStream())
        {
            result.WriteByte(0x78);
            result.WriteByte(0x9C);
            using (var deflate = new DeflateStream(result, CompressionMode.Compress, true))
                deflate.Write(pixels, 0, pixels.Length);
            uint first = 1, second = 0;
            foreach (byte pixel in pixels)
            {
                first = (first + pixel) % 65521;
                second = (second + first) % 65521;
            }
            uint checksum = (second << 16) | first;
            for (int shift = 24; shift >= 0; shift -= 8) result.WriteByte((byte)(checksum >> shift));
            return result.ToArray();
        }
    }
    static void Line(StringBuilder content, double startX, double startY, double endX, double endY)
    {
        content.AppendFormat(CultureInfo.InvariantCulture, "{0} {1} m {2} {3} l S\n",
            Number(startX), Number(startY), Number(endX), Number(endY));
    }
    public static string Generate(string original, string output)
    {
        const double millimeter = 72.0 / 25.4;
        double pageWidth = 215.9 * millimeter, pageHeight = 279.4 * millimeter;
        double width = 195 * millimeter, gap = 8 * millimeter;
        int pixelWidth, pixelHeight;
        byte[] pixels;
        using (var bitmap = new Bitmap(original))
        {
            pixelWidth = bitmap.Width;
            pixelHeight = bitmap.Height;
            pixels = new byte[pixelWidth * pixelHeight * 3];
            int offset = 0;
            for (int row = 0; row < pixelHeight; row++)
            for (int column = 0; column < pixelWidth; column++)
            {
                Color pixel = bitmap.GetPixel(column, row);
                if (pixel.A != 255) throw new Exception("El original contiene transparencia; se requiere confirmar el fondo.");
                pixels[offset++] = pixel.R;
                pixels[offset++] = pixel.G;
                pixels[offset++] = pixel.B;
            }
        }
        double height = width * pixelHeight / pixelWidth;
        double left = (pageWidth - width) / 2;
        double bottom = (pageHeight - 2 * height - gap) / 2;
        double markOffset = millimeter, markLength = 2.5 * millimeter;
        if (bottom - markOffset - markLength < 5 * millimeter)
            throw new Exception("Las dos copias no caben con los margenes previstos.");
        var content = new StringBuilder();
        content.Append("0 G 0.25 w\n");
        foreach (double baseline in new double[] { bottom, bottom + height + gap })
        {
            content.Append("q ").Append(Number(width)).Append(" 0 0 ").Append(Number(height))
                .Append(" ").Append(Number(left)).Append(" ").Append(Number(baseline)).Append(" cm /Original Do Q\n");
            foreach (double cornerX in new double[] { left, left + width })
            foreach (double cornerY in new double[] { baseline, baseline + height })
            {
                double directionX = cornerX == left ? -1 : 1;
                double directionY = cornerY == baseline ? -1 : 1;
                Line(content, cornerX + directionX * markOffset, cornerY,
                    cornerX + directionX * (markOffset + markLength), cornerY);
                Line(content, cornerX, cornerY + directionY * markOffset,
                    cornerX, cornerY + directionY * (markOffset + markLength));
            }
        }
        byte[] imageData = Compress(pixels);
        byte[] contentData = Encoding.ASCII.GetBytes(content.ToString());
        var offsets = new List<long>();
        using (var pdf = new FileStream(output, FileMode.Create, FileAccess.Write))
        {
            Write(pdf, "%PDF-1.4\n");
            offsets.Add(pdf.Position);
            Write(pdf, "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
            offsets.Add(pdf.Position);
            Write(pdf, "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
            offsets.Add(pdf.Position);
            Write(pdf, "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Original 4 0 R >> >> /Contents 5 0 R >>\nendobj\n");
            offsets.Add(pdf.Position);
            Write(pdf, "4 0 obj\n<< /Type /XObject /Subtype /Image /Width " + pixelWidth + " /Height " + pixelHeight
                + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Interpolate false /Filter /FlateDecode /Length " + imageData.Length + " >>\nstream\n");
            pdf.Write(imageData, 0, imageData.Length);
            Write(pdf, "\nendstream\nendobj\n");
            offsets.Add(pdf.Position);
            Write(pdf, "5 0 obj\n<< /Length " + contentData.Length + " >>\nstream\n");
            pdf.Write(contentData, 0, contentData.Length);
            Write(pdf, "endstream\nendobj\n");
            long crossReference = pdf.Position;
            Write(pdf, "xref\n0 6\n0000000000 65535 f \n");
            foreach (long position in offsets) Write(pdf, position.ToString("D10") + " 00000 n \n");
            Write(pdf, "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + crossReference + "\n%%EOF\n");
        }
        byte[] saved = File.ReadAllBytes(output);
        string text = Encoding.ASCII.GetString(saved);
        if (!text.Contains("/MediaBox [0 0 612 792]")) throw new Exception("Formato de pagina incorrecto.");
        MatchCollection copies = Regex.Matches(text, @"q ([\d.]+) 0 0 ([\d.]+) ([\d.]+) ([\d.]+) cm /Original Do Q");
        if (copies.Count != 2) throw new Exception("Numero de copias incorrecto.");
        for (int field = 1; field <= 3; field++)
            if (copies[0].Groups[field].Value != copies[1].Groups[field].Value)
                throw new Exception("Escala o alineacion inconsistente.");
        if (Regex.Matches(text, @"[\d.]+ [\d.]+ m [\d.]+ [\d.]+ l S").Count != 16)
            throw new Exception("Marcas de corte incompletas.");
        int streamStart = text.IndexOf("stream\n", text.IndexOf("4 0 obj")) + 7;
        using (var compressed = new MemoryStream(saved, streamStart + 2, imageData.Length - 6))
        using (var deflate = new DeflateStream(compressed, CompressionMode.Decompress))
        using (var restored = new MemoryStream())
        {
            deflate.CopyTo(restored);
            byte[] decoded = restored.ToArray();
            if (decoded.Length != pixels.Length) throw new Exception("Datos de imagen incompletos.");
            for (int index = 0; index < pixels.Length; index++)
                if (decoded[index] != pixels[index]) throw new Exception("La imagen ha cambiado.");
        }
        return String.Format(CultureInfo.InvariantCulture,
            "Hoja: 215.90 x 279.40 mm, vertical (612 x 792 pt).\r\nCopias: 2, mismo recurso de imagen y escala, centradas.\r\n"
            + "Tamano de corte por copia: 195.00 x {0:0.00} mm.\r\nSeparacion entre lineas de corte: 8.00 mm.\r\n"
            + "Original: {1} x {2} pixeles. Resolucion efectiva: {3:0.0} DPI.\r\n"
            + "Imagen RGB conservada pixel por pixel, compresion sin perdida, sin giro ni recorte.\r\n"
            + "Marcas: 16 segmentos vectoriales negros de 0.25 pt, fuera de cada pieza.\r\n"
            + "Sangrado: NO INCLUIDO. El original no aporta imagen exterior; no se han inventado ni reflejado bordes.\r\n"
            + "Zona segura: textos centrales conservados. Las flores y hojas llegan al corte y no tienen margen seguro.\r\n"
            + "La zona segura y la lectura del QR requieren comprobacion visual y una prueba fisica.\r\n"
            + "Color: RGB del original, sin conversion creativa ni perfil de imprenta inventado. La fidelidad impresa depende del equipo y papel.\r\n"
            + "Calidad: {4}; no se ha interpolado ni generado detalle.\r\n"
            + "Imprimir: papel Carta, vertical, tamano real / 100%, una pagina por hoja. Desactivar ajustar, encoger y multipagina.\r\n"
            + "Se necesita un area imprimible que deje margenes de aproximadamente 7 mm o menos.\r\n"
            + "No es PDF/X ni un archivo con sangrado certificado. Es una imposicion domestica sin sangrado.\r\n"
            + "Validacion automatica: pagina Carta, dos copias, escalas iguales, alineacion, 16 marcas e identidad de pixeles: OK.\r\n",
            height / millimeter, pixelWidth, pixelHeight, pixelWidth / (195 / 25.4),
            pixelWidth / (195 / 25.4) >= 300 ? "supera 300 DPI al tamano elegido" : "inferior a 300 DPI al tamano elegido");
    }
}
'@ -ReferencedAssemblies System.Drawing

$output = Join-Path $WorkingFolder 'Invitacion_2_copias_CARTA_SIN_SANGRADO.pdf'
$report = [PreparacionCarta]::Generate($Original, $output)
$reportPath = Join-Path $WorkingFolder 'LEER_ANTES_DE_IMPRIMIR.txt'
[System.IO.File]::WriteAllText($reportPath, $report, [System.Text.Encoding]::UTF8)
Write-Output $report
Write-Output "PDF: $output"