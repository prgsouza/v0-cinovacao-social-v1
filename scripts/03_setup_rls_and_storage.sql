-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE lends ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Students policies
CREATE POLICY "Users can view all students" ON students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert students" ON students FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update students" ON students FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete students" ON students FOR DELETE USING (auth.role() = 'authenticated');

-- Materials policies
CREATE POLICY "Users can view all materials" ON materials FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert materials" ON materials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update materials" ON materials FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete materials" ON materials FOR DELETE USING (auth.role() = 'authenticated');

-- Activities policies
CREATE POLICY "Users can view all activities" ON activities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert activities" ON activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update activities" ON activities FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete activities" ON activities FOR DELETE USING (auth.role() = 'authenticated');

-- Attendance policies
CREATE POLICY "Users can view all attendance" ON attendance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert attendance" ON attendance FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update attendance" ON attendance FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete attendance" ON attendance FOR DELETE USING (auth.role() = 'authenticated');

-- Lends policies
CREATE POLICY "Users can view all lends" ON lends FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert lends" ON lends FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update lends" ON lends FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete lends" ON lends FOR DELETE USING (auth.role() = 'authenticated');

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('fotos_alunos', 'fotos_alunos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('fotos_atividades', 'fotos_atividades', true);

-- Storage policies for fotos_alunos bucket
CREATE POLICY "Anyone can view student photos" ON storage.objects FOR SELECT USING (bucket_id = 'fotos_alunos');
CREATE POLICY "Authenticated users can upload student photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fotos_alunos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update student photos" ON storage.objects FOR UPDATE USING (bucket_id = 'fotos_alunos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete student photos" ON storage.objects FOR DELETE USING (bucket_id = 'fotos_alunos' AND auth.role() = 'authenticated');

-- Storage policies for fotos_atividades bucket
CREATE POLICY "Anyone can view activity photos" ON storage.objects FOR SELECT USING (bucket_id = 'fotos_atividades');
CREATE POLICY "Authenticated users can upload activity photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fotos_atividades' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update activity photos" ON storage.objects FOR UPDATE USING (bucket_id = 'fotos_atividades' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete activity photos" ON storage.objects FOR DELETE USING (bucket_id = 'fotos_atividades' AND auth.role() = 'authenticated');
