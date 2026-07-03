import re
from pypdf import PdfReader
from pathlib import Path

def extract_text_from_pdf(pdf_path):
    """
    Görev 1: PDF dosyasından ham metni çıkarır.
    """
    try:
        reader = PdfReader(pdf_path)
        raw_text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                raw_text += page_text + "\n"
        return raw_text
    except Exception as e:
        print(f"PDF okunurken hata oluştu: {e}")
        return None

def clean_cv_text(text):
    """
    Görev 2: Çıkarılan metni temizler ve AI'a hazır hale getirir.
    Gereksiz boşlukları, çoklu satır başlarını ve gizli karakterleri ayıklar.
    """
    if not text:
        return ""
    
    # 1. Birden fazla satır atlamasını tek satıra indirger
    text = re.sub(r'\n+', '\n', text)
    
    # 2. Yan yana birden fazla bırakılmış boşlukları temizler
    text = re.sub(r'[ \t]+', ' ', text)
    
    # 3. Satır başlarındaki ve sonlarındaki gereksiz boşlukları kırpar
    text = '\n'.join([line.strip() for line in text.split('\n')])
    
    # 4. Son bir kez genel temizlik
    text = text.strip()
    
    return text

def process_all_cvs(input_folder_name="CVs", output_folder_name="Cleaned-CVs"):
    """
    Belirtilen input klasöründeki tüm PDF CV'leri okur, temizler
    ve output klasörünün altına ayrı ayrı .txt olarak kaydeder.
    """
    input_dir = Path(input_folder_name)
    output_dir = Path(output_folder_name)
    
    # Eğer çıktı (Cleaned-CVs) klasörü yoksa otomatik oluşturur
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Klasörün içindeki tüm .pdf uzantılı dosyaları bulur
    pdf_files = list(input_dir.glob("*.pdf"))
    
    if not pdf_files:
        print(f"Uyarı: '{input_folder_name}' klasöründe hiç PDF dosyası bulunamadı!")
        return

    print(f"Toplam {len(pdf_files)} adet CV bulundu. İşlem başlıyor...\n")
    
    for pdf_path in pdf_files:
        print(f"İşleniyor: {pdf_path.name}")
        
        # 1. Aşama: PDF'den metin çıkarma
        raw_text = extract_text_from_pdf(pdf_path)
        
        if raw_text:
            # 2. Aşama: Metin temizleme
            cleaned_text = clean_cv_text(raw_text)
            
            # Yeni dosya adını belirleme (örn: cv1.pdf -> cv1.txt)
            output_file_name = "cleaned_" + pdf_path.stem + ".txt"
            output_file_path = output_dir / output_file_name
            
            # 3. Aşama: Temizlenen metni kaydetme
            with open(output_file_path, "w", encoding="utf-8") as f:
                f.write(cleaned_text)
                
            print(f"-> Başarılı! Kaydedildi: {output_file_path}")
        else:
            print(f"-> Hata: {pdf_path.name} dosyasından metin çıkarılamadı.")
            
    print("\nTüm CV'lerin temizleme işlemi tamamlandı!")
