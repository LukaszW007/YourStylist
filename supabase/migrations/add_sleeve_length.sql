-- Konwersja kolumny sleeve_length na ENUM type
-- Wartości: 'long-sleeve', 'short-sleeve', 'none' (domyślnie 'none')

-- Krok 1: Zmień typ kolumny z enum na text (jeśli jest enum)
ALTER TABLE garments 
ALTER COLUMN sleeve_length TYPE text;

-- Krok 2: Usuń stary ENUM type (jeśli istnieje)
DROP TYPE IF EXISTS sleeve_length_enum;

-- Krok 3: Utwórz nowy ENUM type
CREATE TYPE sleeve_length_enum AS ENUM ('long-sleeve', 'short-sleeve', 'none');

-- Krok 4: Zaktualizuj wszystkie NULL wartości na 'none' (przed konwersją)
UPDATE garments 
SET sleeve_length = 'none' 
WHERE sleeve_length IS NULL OR sleeve_length = '';

-- Krok 5: Zmień typ kolumny z text na ENUM
ALTER TABLE garments 
ALTER COLUMN sleeve_length TYPE sleeve_length_enum 
USING sleeve_length::sleeve_length_enum;

-- Krok 6: Ustaw domyślną wartość na 'none'
ALTER TABLE garments 
ALTER COLUMN sleeve_length SET DEFAULT 'none';

-- Krok 7: Ustaw NOT NULL (ponieważ zawsze będzie miało wartość 'none' jako default)
ALTER TABLE garments 
ALTER COLUMN sleeve_length SET NOT NULL;

-- Sprawdź wyniki
-- SELECT sleeve_length, COUNT(*) FROM garments GROUP BY sleeve_length;
