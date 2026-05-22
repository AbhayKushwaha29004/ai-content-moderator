import openpyxl

file_path = "uploads/1779227416_Abhay_AI_ML_Jobs_Recommendations.xlsx"
wb = openpyxl.load_workbook(file_path, data_only=True)

extracted_text = ""
with open("excel_contents.txt", "w", encoding="utf-8") as f:
    for sheet in wb.worksheets:
        f.write(f"Sheet Name: {sheet.title}\n")
        for row in sheet.iter_rows(values_only=True):
            row_str = " | ".join([str(cell) for cell in row if cell is not None])
            if row_str:
                f.write(row_str + "\n")
                extracted_text += row_str + "\n"

print("Excel cell content successfully written to excel_contents.txt!")
print("Safe Preview:")
print(extracted_text[:2000].encode('ascii', errors='replace').decode('ascii'))
