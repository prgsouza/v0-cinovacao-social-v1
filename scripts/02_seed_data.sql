-- Insert sample students
INSERT INTO students (name, age, community, can_go_alone, guardian_name, guardian_phone, observations) VALUES
('Ana Silva', 8, 'Vila Nova', false, 'Maria Silva', '(11) 99999-1111', 'Alergia a amendoim'),
('João Santos', 10, 'Centro', true, 'Pedro Santos', '(11) 99999-2222', 'Nenhuma observação'),
('Maria Costa', 9, 'Jardim das Flores', false, 'Ana Costa', '(11) 99999-3333', 'Toma medicamento para asma'),
('Carlos Lima', 7, 'Vila Nova', false, 'José Lima', '(11) 99999-4444', 'Usa óculos'),
('Sofia Rodrigues', 11, 'Centro', true, 'Carla Rodrigues', '(11) 99999-5555', 'Nenhuma observação'),
('Lucas Oliveira', 9, 'Jardim das Flores', false, 'Roberto Oliveira', '(11) 99999-6666', 'Intolerância à lactose');

-- Insert sample materials
INSERT INTO materials (name, quantity, category, description) VALUES
('Lápis', 150, 'Escolar', 'Lápis HB para escrita'),
('Borrachas', 80, 'Escolar', 'Borrachas brancas pequenas'),
('Livros Infantis', 45, 'Educação', 'Livros para crianças de 6-10 anos'),
('Tintas', 25, 'Arte', 'Tintas guache coloridas'),
('Jogos de Tabuleiro', 12, 'Recreação', 'Jogos educativos diversos'),
('Ferramentas', 8, 'Manutenção', 'Ferramentas básicas de manutenção'),
('Lápis de Cor', 2, 'Arte', 'Lápis de cor para atividades artísticas'),
('Cadernos', 5, 'Escolar', 'Cadernos universitários'),
('Bolas de Futebol', 1, 'Esporte', 'Bolas oficiais de futebol'),
('Pincéis', 30, 'Arte', 'Pincéis de diversos tamanhos'),
('Réguas', 25, 'Escolar', 'Réguas de 30cm'),
('Tesouras', 15, 'Escolar', 'Tesouras sem ponta para crianças');

-- Insert sample activities
INSERT INTO activities (title, responsible, spots, description, date) VALUES
('Oficina de Arte', 'Professora Carla', 20, 'Atividade de pintura e desenho para desenvolver a criatividade das crianças.', CURRENT_DATE),
('Aula de Informática', 'Professor João', 15, 'Introdução básica ao uso de computadores e internet.', CURRENT_DATE + INTERVAL '1 day'),
('Recreação no Pátio', 'Monitora Ana', 30, 'Jogos e brincadeiras ao ar livre.', CURRENT_DATE + INTERVAL '2 days');

-- Insert sample attendance for today
INSERT INTO attendance (student_id, date, status)
SELECT id, CURRENT_DATE, 
  CASE 
    WHEN random() < 0.8 THEN 'present'
    WHEN random() < 0.9 THEN 'absent'
    ELSE 'justified'
  END
FROM students;

-- Insert sample lends
INSERT INTO lends (material_id, item_name, borrower, quantity, due_date, category, description, authorized_by, delivered_by)
SELECT 
  m.id,
  m.name,
  CASE 
    WHEN random() < 0.25 THEN 'Pedro Lima'
    WHEN random() < 0.5 THEN 'Carla Mendes'
    WHEN random() < 0.75 THEN 'Lucas Oliveira'
    ELSE 'Sofia Rodrigues'
  END,
  1,
  CURRENT_DATE + INTERVAL '7 days',
  m.category,
  'Empréstimo para atividade educacional',
  'Prof. Ana',
  'Maria'
FROM materials m
WHERE m.name IN ('Livros Infantis', 'Jogos de Tabuleiro', 'Tintas')
LIMIT 3;

-- Insert some overdue lends
INSERT INTO lends (material_id, item_name, borrower, quantity, due_date, category, description, authorized_by, delivered_by)
SELECT 
  m.id,
  m.name,
  CASE 
    WHEN random() < 0.33 THEN 'Maria Silva'
    WHEN random() < 0.66 THEN 'João Santos'
    ELSE 'Ana Costa'
  END,
  1,
  CURRENT_DATE - INTERVAL '5 days',
  m.category,
  'Empréstimo para projeto escolar',
  'Prof. João',
  'Ana'
FROM materials m
WHERE m.name IN ('Lápis de Cor', 'Cadernos')
LIMIT 2;
